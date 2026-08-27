from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application


class ApplicationRepository:
    async def list_for_user(self, session: AsyncSession, user_id: UUID) -> list[Application]:
        result = await session.execute(
            select(Application).where(Application.user_id == user_id).order_by(Application.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_for_user(
        self,
        session: AsyncSession,
        application_id: UUID,
        user_id: UUID,
    ) -> Application | None:
        result = await session.execute(
            select(Application).where(
                Application.id == application_id,
                Application.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        *,
        user_id: UUID,
        visa_category: str,
        status: str,
        current_step: int,
        progress_percentage: int,
        form_data: dict,
    ) -> Application:
        application = Application(
            user_id=user_id,
            visa_category=visa_category,
            status=status,
            current_step=current_step,
            progress_percentage=progress_percentage,
            form_data=form_data,
        )
        session.add(application)
        await session.flush()
        await session.refresh(application)
        return application
