from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.document import Document


class DocumentRepository:
    async def list_for_application(self, session: AsyncSession, application_id: UUID) -> list[Document]:
        result = await session.execute(
            select(Document).where(Document.application_id == application_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_for_application_by_type(
        self,
        session: AsyncSession,
        application_id: UUID,
        document_type: str,
    ) -> list[Document]:
        result = await session.execute(
            select(Document)
            .where(Document.application_id == application_id, Document.document_type == document_type)
            .order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_for_application(self, session: AsyncSession, application_id: UUID, document_id: UUID) -> Document | None:
        result = await session.execute(
            select(Document).where(Document.application_id == application_id, Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_by_type(
        self,
        session: AsyncSession,
        application_id: UUID,
        document_type: str,
    ) -> Document | None:
        result = await session.execute(
            select(Document)
            .where(Document.application_id == application_id, Document.document_type == document_type)
            .order_by(Document.created_at.desc())
        )
        return result.scalars().first()

    async def create(
        self,
        session: AsyncSession,
        *,
        application_id: UUID,
        document_type: str,
        file_name: str,
        storage_path: str,
        public_url: str,
        content_type: str,
        file_size_bytes: int,
    ) -> Document:
        document = Document(
            application_id=application_id,
            document_type=document_type,
            file_name=file_name,
            storage_path=storage_path,
            public_url=public_url,
            content_type=content_type,
            file_size_bytes=file_size_bytes,
        )
        session.add(document)
        await session.flush()
        await session.refresh(document)
        return document

    async def get_for_user(self, session: AsyncSession, document_id: UUID, user_id: UUID) -> Document | None:
        result = await session.execute(
            select(Document)
            .join(Application, Application.id == Document.application_id)
            .where(Document.id == document_id, Application.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, session: AsyncSession, document_id: UUID) -> None:
        await session.execute(delete(Document).where(Document.id == document_id))

    async def delete_instance(self, session: AsyncSession, document: Document) -> None:
        await session.delete(document)
