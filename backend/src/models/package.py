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
from .package_image import PackageImage
from .package_details import PackageDetails
from .package_schedule import PackageSchedule


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
     
    

    
    destination_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("destinations.id"),
            nullable=False
        )
    )
    
    # Removed trip_type_id and offer_id fields
    
    
 
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
    # Removed trip_type and offer relationships
    bookings: List["Booking"] = Relationship(back_populates="package")
    images: List["PackageImage"] = Relationship(back_populates="package", cascade_delete=True)
    details: Optional["PackageDetails"] = Relationship(back_populates="package", cascade_delete=True)
    schedule: Optional["PackageSchedule"] = Relationship(back_populates="package", cascade_delete=True)
    
    def __repr__(self):
        return f"<Package {self.title}>"

    @property
    def image_gallery(self) -> List[str]:
        """Get list of image URLs ordered by display_order."""
        return [img.image_url for img in sorted(self.images, key=lambda x: x.display_order)]
    
    @property
    def primary_image(self) -> Optional[str]:
        """Get the primary image URL."""
        primary_images = [img for img in self.images if img.is_primary]
        if primary_images:
            return primary_images[0].image_url
        # Fallback to featured_image or first image
        return self.featured_image or (self.images[0].image_url if self.images else None)

    @property
    def effective_price(self) -> float:
        """Return the package price (offer logic removed)."""
        return self.price

    @property
    def is_available(self) -> bool:
        """Check if the package is currently available for booking."""
        if not self.schedule:
            return self.is_active
        
        now = datetime.now()
        return (
            self.is_active and
            (self.schedule.available_from is None or self.schedule.available_from <= now) and
            (self.schedule.available_until is None or now <= self.schedule.available_until)
        )
