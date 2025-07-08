from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class PackageDetails(SQLModel, table=True):
    """Detailed content for packages - normalized from main package table."""
    __tablename__ = "package_details"
    
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
            nullable=False,
            unique=True  # One-to-one relationship
        )
    )
    
    highlights: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    itinerary: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    inclusions: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    exclusions: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    terms_conditions: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            onupdate=datetime.now,
            nullable=False
        )
    )
    
    # Relationships
    package: "Package" = Relationship(back_populates="details")

    def __repr__(self):
        return f"<PackageDetails for Package {self.package_id}>"
