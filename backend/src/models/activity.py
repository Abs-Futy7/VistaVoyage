from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class Activity(SQLModel, table=True):
    """Activity model for activities included in packages."""
    __tablename__ = "activities"
    
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
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    activity_type: str = Field(
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=False
        )
    )
    
    duration_hours: Optional[float] = Field(
        default=None,
        sa_column=Column(
            pg.NUMERIC(4, 2),
            nullable=True
        )
    )
    
    difficulty_level: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=True
        )
    )
    
    age_restriction: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(50),
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
    # Note: Many-to-many relationship with Package will be handled through PackageActivityLink

    def __repr__(self):
        return f"<Activity {self.name}>"
