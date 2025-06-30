from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .booking import Booking
    from .destination import Destination
    from .trip_type import TripType
    from .offer import Offer
    from .activity import Activity


class PackageDifficulty(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
    EXPERT = "expert"


class Package(SQLModel, table=True):
    """Package model for travel packages."""
    __tablename__ = "packages"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    title: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    
    description: str = Field(
        sa_column=Column(
            pg.TEXT,
            nullable=False
        )
    )
    
    
    
    price: float = Field(
        sa_column=Column(
            pg.NUMERIC(10, 2),
            nullable=False
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
    
    destination_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("destinations.id"),
            nullable=False
        )
    )
    
    trip_type_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("trip_types.id"),
            nullable=False
        )
    )
    
    offer_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("offers.id"),
            nullable=True
        )
    )
    
    
 
    featured_image: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(500),
            nullable=True
        )
    )
   
    is_featured: bool = Field(
        default=False,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=False
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
    destination: "Destination" = Relationship(back_populates="packages")
    trip_type: "TripType" = Relationship(back_populates="packages")
    offer: Optional["Offer"] = Relationship(back_populates="packages")
    bookings: List["Booking"] = Relationship(back_populates="package")

    def __repr__(self):
        return f"<Package {self.title}>"

    @property
    def effective_price(self) -> float:
        """Calculate the effective price considering any active offers."""
        if self.offer and self.offer.is_valid:
            if self.offer.discount_percentage:
                return self.price * (1 - self.offer.discount_percentage / 100)
            elif self.offer.discount_amount:
                return max(0, self.price - self.offer.discount_amount)
        return self.price

    @property
    def is_available(self) -> bool:
        """Check if the package is currently available for booking."""
        now = datetime.now()
        return (
            self.is_active and
            (self.available_from is None or self.available_from <= now) and
            (self.available_until is None or now <= self.available_until)
        )
