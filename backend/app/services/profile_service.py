from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import ProfilePayload, ProfileResponse


class ProfileService:
    def __init__(self) -> None:
        self.repository = ProfileRepository()

    async def get_profile(self, session: AsyncSession, current_user: User) -> ProfileResponse:
        profile = await self.repository.get_by_user_id(session, current_user.id)
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved profile not found.")

        return ProfileResponse(
            profile_id=profile.id,
            user_id=profile.user_id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            date_of_birth=profile.date_of_birth,
            nationality=profile.nationality,
            gender=profile.gender,
            marital_status=profile.marital_status,
            occupation=profile.occupation,
            passport_number=profile.passport_number,
            issuing_country=profile.issuing_country,
            issue_date=profile.issue_date,
            expiry_date=profile.expiry_date,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    async def upsert_profile(
        self,
        session: AsyncSession,
        current_user: User,
        payload: ProfilePayload,
    ) -> ProfileResponse:
        profile = await self.repository.upsert(session, current_user.id, payload.model_dump())
        await session.commit()
        await session.refresh(profile)
        return await self.get_profile(session, current_user)
