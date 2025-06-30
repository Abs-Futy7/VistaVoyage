"""Add current_usage field to promo_codes table

Revision ID: add_current_usage_promo
Revises: 8893b244b6c6
Create Date: 2025-01-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_current_usage_promo'
down_revision: Union[str, None] = '0b4f503227f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add current_usage column to promo_codes table
    op.add_column('promo_codes', sa.Column('current_usage', sa.INTEGER(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove current_usage column from promo_codes table
    op.drop_column('promo_codes', 'current_usage')
