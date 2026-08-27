import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ApplicantProfile(Base):
    __tablename__ = "applicant_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    date_of_birth: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    nationality: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    gender: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    marital_status: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    occupation: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    passport_number: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    issuing_country: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    issue_date: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    expiry_date: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
