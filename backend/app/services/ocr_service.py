from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.application_repository import ApplicationRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.application import ApplicationFormData
from app.schemas.ocr import OcrExtractedFields, PassportOcrExtraction, PassportOcrRequest, PassportOcrResponse


class OcrService:
    def __init__(self) -> None:
        self.application_repository = ApplicationRepository()
        self.document_repository = DocumentRepository()

    async def simulate_passport_scan(
        self,
        session: AsyncSession,
        current_user: User,
        payload: PassportOcrRequest,
    ) -> PassportOcrResponse:
        application = await self.application_repository.get_for_user(session, payload.application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        if application.status == "Submitted":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted applications are sealed and OCR can no longer update them.",
            )

        if payload.document_id is not None:
            document = await self.document_repository.get_for_application(session, application.id, payload.document_id)
        else:
            document = await self.document_repository.get_latest_by_type(session, application.id, "passport_scan")

        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passport scan not found for this application.")
        if document.document_type != "passport_scan":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OCR is only supported for passport scans.")

        extraction = self._build_extraction(application.form_data or {}, current_user.full_name or "", document.file_name)
        document.extracted_ocr_data = extraction.model_dump(mode="json")

        await session.commit()
        await session.refresh(document)

        return PassportOcrResponse(
            document_id=document.id,
            application_id=application.id,
            **extraction.model_dump(),
        )

    def _build_extraction(self, stored_form_data: dict, full_name: str, file_name: str) -> PassportOcrExtraction:
        form_data = ApplicationFormData.model_validate(stored_form_data)
        first_name, last_name = self._split_name(
            form_data.personal.first_name,
            form_data.personal.last_name,
            full_name,
        )
        nationality = self._first_non_empty(form_data.personal.nationality, form_data.passport.issuing_country, "USA")
        issuing_country = self._first_non_empty(form_data.passport.issuing_country, nationality)

        today = datetime.now(timezone.utc).date()
        issue_date = self._first_non_empty(form_data.passport.issue_date, (today - timedelta(days=365 * 4)).isoformat())
        expiry_date = self._first_non_empty(form_data.passport.expiry_date, (today + timedelta(days=365 * 6)).isoformat())
        passport_number = self._first_non_empty(
            form_data.passport.passport_number.upper(),
            self._generate_passport_number(file_name, first_name, last_name),
        )

        extracted_fields = OcrExtractedFields(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=self._first_non_empty(form_data.personal.date_of_birth, "1994-08-17"),
            nationality=nationality,
            passport_number=passport_number,
            issuing_country=issuing_country,
            issue_date=issue_date,
            expiry_date=expiry_date,
        )

        confidence_seed = sum(ord(character) for character in f"{file_name}{passport_number}{issuing_country}")
        confidence_score = round(0.86 + (confidence_seed % 11) / 100, 2)

        return PassportOcrExtraction(
            extracted_at=datetime.now(timezone.utc),
            confidence_score=confidence_score,
            extracted_fields=extracted_fields,
            advisory_notes=[
                "Review all auto-filled values against the passport bio page before continuing.",
                "This MVP keeps OCR simulated and lets applicants edit every extracted field.",
                "Use the same passport for travel that you used in the e-Visa application.",
            ],
        )

    def _split_name(self, first_name: str, last_name: str, full_name: str) -> tuple[str, str]:
        if first_name or last_name:
            return first_name or "Applicant", last_name

        name_parts = [part for part in full_name.split() if part]
        if not name_parts:
            return "Applicant", ""
        if len(name_parts) == 1:
            return name_parts[0], ""
        return name_parts[0], " ".join(name_parts[1:])

    def _generate_passport_number(self, file_name: str, first_name: str, last_name: str) -> str:
        seed = "".join(character for character in f"{file_name}{first_name}{last_name}".upper() if character.isalnum())
        letters = "".join(character for character in seed if character.isalpha())
        digits = "".join(character for character in seed if character.isdigit())
        prefix = (letters or "PV")[:2].ljust(2, "V")
        suffix = (digits or "7318249")[:7].ljust(7, "4")
        return f"{prefix}{suffix}"

    def _first_non_empty(self, *values: str) -> str:
        for value in values:
            if value and value.strip():
                return value.strip()
        return ""
