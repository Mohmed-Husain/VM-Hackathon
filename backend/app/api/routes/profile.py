from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.profile import ProfilePayload, ProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter()
service = ProfileService()


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileResponse:
    return await service.get_profile(session, current_user)


@router.put("", response_model=ProfileResponse)
async def upsert_profile(
    payload: ProfilePayload,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ProfileResponse:
    return await service.upsert_profile(session, current_user, payload)
