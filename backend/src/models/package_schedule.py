from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class PackageSchedule(SQLModel, table=True):
    """Schedule and availability information for packages - normalized from main package table."""
    __tablename__ = "package_schedules"
    
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
    
    duration_days: int = Field(
        sa_column=Column(
            pg.INTEGER,
            nullable=False
        )
    )
    
    duration_nights: int = Field(
        sa_column=Column(
            pg.INTEGER,
            nullable=False
        )
    )
    
    max_group_size: Optional[int] = Field(
        default=None,
        sa_column=Column(
            pg.INTEGER,
            nullable=True
        )
    )
    
    available_from: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
        )
    )
    
    available_until: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            pg.TIMESTAMP,
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
    package: "Package" = Relationship(back_populates="schedule")

    def __repr__(self):
        return f"<PackageSchedule {self.duration_days}D/{self.duration_nights}N for Package {self.package_id}>"
