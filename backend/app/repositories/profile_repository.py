from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.applicant_profile import ApplicantProfile


class ProfileRepository:
    async def get_by_user_id(self, session: AsyncSession, user_id) -> ApplicantProfile | None:
        result = await session.execute(select(ApplicantProfile).where(ApplicantProfile.user_id == user_id))
        return result.scalar_one_or_none()

    async def upsert(self, session: AsyncSession, user_id, payload: dict) -> ApplicantProfile:
        profile = await self.get_by_user_id(session, user_id)
        if profile is None:
            profile = ApplicantProfile(user_id=user_id, **payload)
            session.add(profile)
            await session.flush()
            await session.refresh(profile)
            return profile

        for field, value in payload.items():
            setattr(profile, field, value)

        await session.flush()
        await session.refresh(profile)
        return profile
