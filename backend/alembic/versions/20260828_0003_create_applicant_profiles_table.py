"""create applicant profiles table

Revision ID: 20260828_0003
Revises: 20260828_0002
Create Date: 2026-08-28 02:40:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260828_0003"
down_revision = "20260828_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "applicant_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.String(length=20), nullable=False),
        sa.Column("nationality", sa.String(length=20), nullable=False),
        sa.Column("gender", sa.String(length=20), nullable=False),
        sa.Column("marital_status", sa.String(length=50), nullable=False),
        sa.Column("occupation", sa.String(length=120), nullable=False),
        sa.Column("passport_number", sa.String(length=20), nullable=False),
        sa.Column("issuing_country", sa.String(length=20), nullable=False),
        sa.Column("issue_date", sa.String(length=20), nullable=False),
        sa.Column("expiry_date", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_applicant_profiles_user_id"), "applicant_profiles", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_applicant_profiles_user_id"), table_name="applicant_profiles")
    op.drop_table("applicant_profiles")
