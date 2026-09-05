"""create payment_attempts table

Revision ID: 20260905_0006
Revises: 20260828_0005
Create Date: 2026-09-05 20:20:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260905_0006"
down_revision = "20260828_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "payment_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("attempt_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("payment_method", sa.String(length=30), nullable=False),
        sa.Column("card_last_four", sa.String(length=4), nullable=True),
        sa.Column("amount_usd", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("failure_reason", sa.String(length=200), nullable=True),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_payment_attempts_user_id", "payment_attempts", ["user_id"])
    op.create_index("ix_payment_attempts_application_id", "payment_attempts", ["application_id"])


def downgrade() -> None:
    op.drop_index("ix_payment_attempts_application_id", table_name="payment_attempts")
    op.drop_index("ix_payment_attempts_user_id", table_name="payment_attempts")
    op.drop_table("payment_attempts")

