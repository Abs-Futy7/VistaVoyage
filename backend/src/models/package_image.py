from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class PackageImage(SQLModel, table=True):
    """Package image model for storing individual package images."""
    __tablename__ = "package_images"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    package_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    
    image_url: str = Field(
        sa_column=Column(
            pg.VARCHAR(500),
            nullable=False
        )
    )
    
    alt_text: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=True
        )
    )
    
    display_order: int = Field(
        default=0,
        sa_column=Column(
            pg.INTEGER,
            nullable=False,
            default=0
        )
    )
    
    is_primary: bool = Field(
        default=False,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=False
        )
    )
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            nullable=False
        )
    )
    
    # Relationships
    package: "Package" = Relationship(back_populates="images")
    
    def __repr__(self):
        return f"<PackageImage {self.image_url}>"
