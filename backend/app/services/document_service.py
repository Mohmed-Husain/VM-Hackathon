from pathlib import Path
from uuid import UUID
import time

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User
from app.repositories.application_repository import ApplicationRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.application import ApplicationFormData
from app.schemas.document import DocumentResponse
from app.schemas.ocr import PassportOcrExtraction
from app.utils.application_rules import build_validation_summary, derive_status

ALLOWED_DOCUMENT_TYPES = {"passport_scan", "applicant_photo", "flight_itinerary", "hotel_booking"}
DOCUMENT_FLAG_BY_TYPE = {
    "passport_scan": "passport_scan_ready",
    "applicant_photo": "applicant_photo_ready",
    "flight_itinerary": "flight_itinerary_ready",
    "hotel_booking": "hotel_booking_ready",
}


class DocumentService:
    def __init__(self) -> None:
        self.application_repository = ApplicationRepository()
        self.document_repository = DocumentRepository()

    async def list_documents(
        self,
        session: AsyncSession,
        current_user: User,
        application_id: UUID,
    ) -> list[DocumentResponse]:
        application = await self.application_repository.get_for_user(session, application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        documents = await self.document_repository.list_for_application(session, application_id)
        return [self._serialize(document) for document in documents]

    async def upload_document(
        self,
        session: AsyncSession,
        current_user: User,
        application_id: UUID,
        document_type: str,
        file: UploadFile,
    ) -> DocumentResponse:
        application = await self.application_repository.get_for_user(session, application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        if document_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported document type.")
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A file is required.")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty.")

        extension = Path(file.filename).suffix or ".bin"
        timestamp = int(time.time())
        relative_path = Path("visa-documents") / str(application_id) / f"{document_type}_{timestamp}{extension}"
        destination_path = settings.storage_root / relative_path
        destination_path.parent.mkdir(parents=True, exist_ok=True)

        existing_documents = await self.document_repository.list_for_application_by_type(session, application_id, document_type)
        for existing_document in existing_documents:
            existing_file_path = settings.storage_root / existing_document.storage_path
            if existing_file_path.exists():
                existing_file_path.unlink()
            await self.document_repository.delete_instance(session, existing_document)

        destination_path.write_bytes(content)

        document = await self.document_repository.create(
            session,
            application_id=application_id,
            document_type=document_type,
            file_name=file.filename,
            storage_path=relative_path.as_posix(),
            public_url=f"{settings.backend_public_url}/storage/{relative_path.as_posix()}",
            content_type=file.content_type or "application/octet-stream",
            file_size_bytes=len(content),
        )

        documents = await self.document_repository.list_for_application(session, application_id)
        self._sync_document_flags(application, documents)
        await session.commit()
        await session.refresh(document)
        return self._serialize(document)

    async def delete_document(self, session: AsyncSession, current_user: User, document_id: UUID) -> None:
        document = await self.document_repository.get_for_user(session, document_id, current_user.id)
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        file_path = settings.storage_root / document.storage_path
        if file_path.exists():
            file_path.unlink()

        application = await self.application_repository.get_for_user(session, document.application_id, current_user.id)
        await self.document_repository.delete(session, document.id)
        remaining_documents = await self.document_repository.list_for_application(session, document.application_id)

        if application is not None:
            self._sync_document_flags(application, remaining_documents)

        await session.commit()

    def _sync_document_flags(self, application, documents) -> None:
        form_data = ApplicationFormData.model_validate(application.form_data or {})
        payload = form_data.model_dump()
        grouped_types = {document.document_type for document in documents}

        for document_type, field_name in DOCUMENT_FLAG_BY_TYPE.items():
            payload["documents"][field_name] = document_type in grouped_types

        updated_form_data = ApplicationFormData.model_validate(payload)
        validation_summary = build_validation_summary(updated_form_data)
        application.form_data = updated_form_data.model_dump()
        application.progress_percentage = validation_summary.progress_percentage
        application.status = derive_status(validation_summary)

    def _serialize(self, document) -> DocumentResponse:
        ocr_extraction = None
        if document.extracted_ocr_data:
            ocr_extraction = PassportOcrExtraction.model_validate(document.extracted_ocr_data)

        return DocumentResponse(
            document_id=document.id,
            application_id=document.application_id,
            document_type=document.document_type,
            file_name=document.file_name,
            storage_path=document.storage_path,
            public_url=document.public_url,
            content_type=document.content_type,
            file_size_bytes=document.file_size_bytes,
            ocr_extraction=ocr_extraction,
            created_at=document.created_at,
        )
