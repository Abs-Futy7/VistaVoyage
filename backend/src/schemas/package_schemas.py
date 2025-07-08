from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid
from .package_image_schemas import PackageImageResponseModel
from .package_details_schemas import PackageDetailsResponseModel
from .package_schedule_schemas import PackageScheduleResponseModel


class PackageCategoryEnum(str, Enum):
    ADVENTURE = "Adventure" 
    ROMANCE = "Romance"
    FAMILY = "Family"
    CULTURE = "Culture"
    BEACH = "Beach"
    MOUNTAIN = "Mountain"
    CITY = "City"
    WILDLIFE = "Wildlife"


class PackageDifficultyEnum(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
    EXPERT = "expert"


class PackageCreateModel(BaseModel):
    """Schema for creating a package - includes schedule and details data"""
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    price: float = Field(gt=0)
    destination_id: uuid.UUID
    trip_type_id: uuid.UUID
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    
    # Schedule data (will be created in separate table)
    duration_days: int = Field(gt=0)
    duration_nights: int = Field(gt=0)
    max_group_size: Optional[int] = Field(None, gt=0)
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    
    # Details data (will be created in separate table)
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    image_gallery: Optional[List[str]] = None


class PackageUpdateModel(BaseModel):
    """Schema for updating a package"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    destination_id: Optional[uuid.UUID] = None
    trip_type_id: Optional[uuid.UUID] = None
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    
    # Schedule data updates
    duration_days: Optional[int] = Field(None, gt=0)
    duration_nights: Optional[int] = Field(None, gt=0)
    max_group_size: Optional[int] = Field(None, gt=0)
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    
    # Details data updates
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    image_gallery: Optional[List[str]] = None


class PackageResponseModel(BaseModel):
    """Basic package response model"""
    id: uuid.UUID
    title: str
    description: str
    price: float
    duration_days: Optional[int] = None
    duration_nights: Optional[int] = None
    destination_id: uuid.UUID
    trip_type_id: uuid.UUID
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
class PackageDetailResponseModel(BaseModel):
    """Detailed package response with normalized related data"""
    id: uuid.UUID
    title: str
    description: str
    price: float
    destination_id: uuid.UUID
    trip_type_id: uuid.UUID
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Related data from normalized tables
    schedule: Optional[PackageScheduleResponseModel] = None
    details: Optional[PackageDetailsResponseModel] = None
    images: Optional[List[PackageImageResponseModel]] = None
    
    # Relationship names for display
    destination_name: Optional[str] = None
    trip_type_name: Optional[str] = None
    offer_title: Optional[str] = None
    
    # Computed fields for backward compatibility
    duration_days: Optional[int] = None  # From schedule
    duration_nights: Optional[int] = None  # From schedule
    highlights: Optional[str] = None  # From details
    itinerary: Optional[str] = None  # From details
    image_gallery: Optional[List[str]] = None  # From images
    
    class Config:
        from_attributes = True


class PackageListResponseModel(BaseModel):
    """Response model for paginated package lists"""
    packages: List[PackageResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int


