from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.user import User
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application import (
    ApplicationDetailResponse,
    ApplicationFormData,
    ApplicationSummaryResponse,
    CreateApplicationRequest,
    SaveDraftRequest,
    StepValidationResponse,
    SubmitApplicationResponse,
    ValidationIssueResponse,
    ValidationSummaryResponse,
)
from app.utils.application_rules import build_validation_summary, derive_status


def build_empty_form_data() -> dict:
    return ApplicationFormData().model_dump()


class ApplicationService:
    def __init__(self) -> None:
        self.repository = ApplicationRepository()

    async def list_applications(self, session: AsyncSession, current_user: User) -> list[ApplicationSummaryResponse]:
        applications = await self.repository.list_for_user(session, current_user.id)
        return [self._serialize_summary(application) for application in applications]

    async def create_application(
        self,
        session: AsyncSession,
        current_user: User,
        payload: CreateApplicationRequest,
    ) -> ApplicationDetailResponse:
        if payload.user_id is not None and payload.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create applications for another user.")

        application = await self.repository.create(
            session,
            user_id=current_user.id,
            visa_category=payload.visa_category,
            status="Draft",
            current_step=1,
            progress_percentage=0,
            form_data=build_empty_form_data(),
        )
        await session.commit()
        await session.refresh(application)
        return self._serialize_detail(application)

    async def get_application(
        self,
        session: AsyncSession,
        current_user: User,
        application_id: UUID,
    ) -> ApplicationDetailResponse:
        application = await self.repository.get_for_user(session, application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        return self._serialize_detail(application)

    async def save_draft(
        self,
        session: AsyncSession,
        current_user: User,
        application_id: UUID,
        payload: SaveDraftRequest,
    ) -> ApplicationDetailResponse:
        application = await self.repository.get_for_user(session, application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        if application.status == "Submitted":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Submitted applications are sealed and can no longer be edited.",
            )

        if application.current_step == payload.current_step and (application.form_data or {}) == payload.form_data.model_dump():
            return self._serialize_detail(application)

        validation_summary = build_validation_summary(payload.form_data)
        application.current_step = payload.current_step
        application.form_data = payload.form_data.model_dump()
        application.progress_percentage = validation_summary.progress_percentage
        application.status = derive_status(validation_summary)

        await session.commit()
        await session.refresh(application)
        return self._serialize_detail(application)

    async def submit_application(
        self,
        session: AsyncSession,
        current_user: User,
        application_id: UUID,
    ) -> SubmitApplicationResponse:
        application = await self.repository.get_for_user(session, application_id, current_user.id)
        if application is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        if application.status == "Submitted":
            if application.submitted_at is None or application.submitted_snapshot is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This application is marked submitted but its sealed snapshot is unavailable.",
                )
            return SubmitApplicationResponse(
                application_id=application.id,
                status="Submitted",
                submitted_at=application.submitted_at,
                submitted_snapshot=application.submitted_snapshot,
                message="Application was already submitted.",
            )

        form_data = ApplicationFormData.model_validate(application.form_data or {})
        validation_summary = build_validation_summary(form_data)
        if not validation_summary.is_review_ready or not validation_summary.step_completion[5]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The application is not ready for submission. Complete all steps and accept the declaration first.",
            )

        submitted_at = datetime.now(timezone.utc)
        application.current_step = 5
        application.progress_percentage = 100
        application.status = "Submitted"
        application.submitted_at = submitted_at
        application.submitted_snapshot = {
            "application_id": str(application.id),
            "user_id": str(application.user_id),
            "visa_category": application.visa_category,
            "status": "Submitted",
            "submitted_at": submitted_at.isoformat(),
            "form_data": form_data.model_dump(),
            "validation_summary": self._serialize_validation_summary(validation_summary).model_dump(mode="json"),
        }

        await session.commit()
        await session.refresh(application)

        return SubmitApplicationResponse(
            application_id=application.id,
            status="Submitted",
            submitted_at=submitted_at,
            submitted_snapshot=application.submitted_snapshot,
            message="Application sealed successfully. Payment remains hidden in this MVP, so submission completes without checkout.",
        )

    def _serialize_summary(self, application: Application) -> ApplicationSummaryResponse:
        form_data = ApplicationFormData.model_validate(application.form_data or {})
        validation_summary = build_validation_summary(form_data)
        return ApplicationSummaryResponse(
            application_id=application.id,
            visa_category=application.visa_category,
            status=self._resolved_status(application.status, validation_summary),
            current_step=application.current_step,
            progress_percentage=validation_summary.progress_percentage,
            updated_at=application.updated_at,
        )

    def _serialize_detail(self, application: Application) -> ApplicationDetailResponse:
        form_data = ApplicationFormData.model_validate(application.form_data or {})
        validation_summary = build_validation_summary(form_data)
        return ApplicationDetailResponse(
            application_id=application.id,
            user_id=application.user_id,
            visa_category=application.visa_category,
            status=self._resolved_status(application.status, validation_summary),
            current_step=application.current_step,
            progress_percentage=validation_summary.progress_percentage,
            form_data=form_data,
            validation_summary=self._serialize_validation_summary(validation_summary),
            submitted_at=application.submitted_at,
            submitted_snapshot=application.submitted_snapshot,
            created_at=application.created_at,
            updated_at=application.updated_at,
        )

    def _serialize_validation_summary(self, validation_summary) -> ValidationSummaryResponse:
        return ValidationSummaryResponse(
            is_review_ready=validation_summary.is_review_ready,
            progress_percentage=validation_summary.progress_percentage,
            steps=[
                StepValidationResponse(
                    step=step,
                    is_complete=validation_summary.step_completion[step],
                    issues=[
                        ValidationIssueResponse(field=field, messages=messages)
                        for field, messages in validation_summary.step_errors[step].items()
                    ],
                )
                for step in range(1, 6)
            ],
        )

    def _resolved_status(self, stored_status: str, validation_summary) -> str:
        if stored_status in {"Payment Pending", "Submitted"}:
            return stored_status
        return derive_status(validation_summary)
