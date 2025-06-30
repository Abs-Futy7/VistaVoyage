from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package


class TripType(SQLModel, table=True):
    """Trip type model for categorizing travel packages."""
    __tablename__ = "trip_types"
    
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
            pg.VARCHAR(100),
            nullable=False,
            unique=True
        )
    )
    
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    category: str = Field(
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False
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
    packages: List["Package"] = Relationship(back_populates="trip_type")

    def __repr__(self):
        return f"<TripType {self.name}>"
