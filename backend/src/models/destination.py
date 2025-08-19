from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import UniqueConstraint, ForeignKey
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class Destination(SQLModel, table=True):
    """Destination model for travel destinations."""
    __tablename__ = "destinations"
    __table_args__ = (
        UniqueConstraint("name", "city", "country", name="unique_destination_name_location"),
    )
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    name: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    
    country: str = Field(
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=False
        )
    )
    
    city: str = Field(
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=False
        )
    )
    
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )

    created_by: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("admins.id"),
            nullable=False
        )
    )
    
    best_time_to_visit: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=True
        )
    )
    
    featured_image: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    is_active: bool = Field(
        default=True,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=True
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
    packages: List["Package"] = Relationship(back_populates="destination")

    def __repr__(self):
        return f"<Destination {self.name}, {self.country}>"
