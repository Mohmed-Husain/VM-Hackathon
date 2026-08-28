"""create users table

Revision ID: 20260828_0001
Revises:
Create Date: 2026-08-28 01:45:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260828_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "users" not in inspector.get_table_names():
        op.create_table(
            "users",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("users")}
    users_email_index = op.f("ix_users_email")
    if users_email_index not in existing_indexes:
        op.create_index(users_email_index, "users", ["email"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    users_email_index = op.f("ix_users_email")

    if "users" in inspector.get_table_names():
        existing_indexes = {index["name"] for index in inspector.get_indexes("users")}
        if users_email_index in existing_indexes:
            op.drop_index(users_email_index, table_name="users")
        op.drop_table("users")
