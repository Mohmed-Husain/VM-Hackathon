from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.application import (
    ApplicationDetailResponse,
    ApplicationSummaryResponse,
    CreateApplicationRequest,
    SaveDraftRequest,
    SubmitApplicationResponse,
)
from app.services.application_service import ApplicationService

router = APIRouter()
service = ApplicationService()


@router.get("", response_model=list[ApplicationSummaryResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[ApplicationSummaryResponse]:
    return await service.list_applications(session, current_user)


@router.post("", response_model=ApplicationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: CreateApplicationRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApplicationDetailResponse:
    return await service.create_application(session, current_user, payload)


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApplicationDetailResponse:
    return await service.get_application(session, current_user, application_id)


@router.put("/{application_id}/draft", response_model=ApplicationDetailResponse)
async def save_application_draft(
    application_id: UUID,
    payload: SaveDraftRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApplicationDetailResponse:
    return await service.save_draft(session, current_user, application_id, payload)


@router.post("/{application_id}/submit", response_model=SubmitApplicationResponse)
async def submit_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> SubmitApplicationResponse:
    return await service.submit_application(session, current_user, application_id)
