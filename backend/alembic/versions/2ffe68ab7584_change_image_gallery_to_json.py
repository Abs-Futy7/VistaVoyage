"""change_image_gallery_to_json

Revision ID: 2ffe68ab7584
Revises: d2a926d70725
Create Date: 2025-06-30 21:10:46.081388

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2ffe68ab7584'
down_revision: Union[str, Sequence[str], None] = 'd2a926d70725'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: Update existing TEXT data to proper JSON format
    # First, update any existing TEXT values to JSON array format
    op.execute("""
        UPDATE packages 
        SET image_gallery = CASE 
            WHEN image_gallery IS NULL OR image_gallery = '' THEN NULL
            WHEN image_gallery LIKE '[%]' THEN image_gallery  -- Already looks like JSON array
            ELSE '["' || image_gallery || '"]'  -- Wrap single string in JSON array
        END
    """)
    
    # Step 2: Convert column type from TEXT to JSON using USING clause
    op.alter_column('packages', 'image_gallery',
               existing_type=sa.TEXT(),
               type_=postgresql.JSON(astext_type=sa.Text()),
               existing_nullable=True,
               postgresql_using='image_gallery::json')


def downgrade() -> None:
    """Downgrade schema."""
    # Convert JSON back to TEXT
    # Extract first element if it's a JSON array, otherwise convert to string
    op.execute("""
        UPDATE packages 
        SET image_gallery = CASE 
            WHEN image_gallery IS NULL THEN NULL
            WHEN jsonb_typeof(image_gallery::jsonb) = 'array' AND jsonb_array_length(image_gallery::jsonb) > 0 
                THEN image_gallery::jsonb->>0  -- Get first element as text
            ELSE image_gallery::text
        END
    """)
    
    op.alter_column('packages', 'image_gallery',
               existing_type=postgresql.JSON(astext_type=sa.Text()),
               type_=sa.TEXT(),
               existing_nullable=True)
