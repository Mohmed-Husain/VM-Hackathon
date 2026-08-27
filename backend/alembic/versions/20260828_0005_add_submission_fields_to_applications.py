"""add submission fields to applications

Revision ID: 20260828_0005
Revises: 20260828_0004
Create Date: 2026-08-28 05:20:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260828_0005"
down_revision = "20260828_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("submitted_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("applications", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("applications", "submitted_at")
    op.drop_column("applications", "submitted_snapshot")
