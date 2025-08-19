from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package

class PackageDetailSchedule(SQLModel, table=True):
    __tablename__ = "package_detail_schedule"

    package_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
            primary_key=True

        )
    )

    # Details fields
    highlights: Optional[str] = Field(default=None, sa_column=Column(pg.TEXT, nullable=True))
    itinerary: Optional[str] = Field(default=None, sa_column=Column(pg.TEXT, nullable=True))
    inclusions: Optional[str] = Field(default=None, sa_column=Column(pg.TEXT, nullable=True))
    exclusions: Optional[str] = Field(default=None, sa_column=Column(pg.TEXT, nullable=True))
    terms_conditions: Optional[str] = Field(default=None, sa_column=Column(pg.TEXT, nullable=True))

    # Schedule fields
    duration_days: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    duration_nights: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    max_group_size: Optional[int] = Field(default=None, sa_column=Column(pg.INTEGER, nullable=True))
    available_from: Optional[datetime] = Field(default=None, sa_column=Column(pg.TIMESTAMP, nullable=True))
    available_until: Optional[datetime] = Field(default=None, sa_column=Column(pg.TIMESTAMP, nullable=True))

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(pg.TIMESTAMP, default=datetime.utcnow, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(pg.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False))
