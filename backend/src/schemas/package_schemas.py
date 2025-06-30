from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


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
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    price: float = Field(gt=0)
    duration_days: int = Field(gt=0)
    duration_nights: int = Field(gt=0)
    destination_id: uuid.UUID
    trip_type_id: uuid.UUID
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    
    # Detailed content fields
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    image_gallery: Optional[List[str]] = None  # JSON array of image URLs
    max_group_size: Optional[int] = Field(None, gt=0)
    min_age: Optional[int] = Field(None, ge=0)
    difficulty_level: Optional[PackageDifficultyEnum] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class PackageUpdateModel(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    duration_days: Optional[int] = Field(None, gt=0)
    duration_nights: Optional[int] = Field(None, gt=0)
    destination_id: Optional[uuid.UUID] = None
    trip_type_id: Optional[uuid.UUID] = None
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    
    # Detailed content fields
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    image_gallery: Optional[List[str]] = None
    max_group_size: Optional[int] = Field(None, gt=0)
    min_age: Optional[int] = Field(None, ge=0)
    difficulty_level: Optional[PackageDifficultyEnum] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class PackageResponseModel(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    price: float
    duration_days: int
    duration_nights: int
    destination_id: uuid.UUID
    trip_type_id: uuid.UUID
    offer_id: Optional[uuid.UUID] = None
    featured_image: Optional[str] = None
    is_featured: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Detailed content fields
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    image_gallery: Optional[List[str]] = None
    max_group_size: Optional[int] = None
    min_age: Optional[int] = None
    difficulty_level: Optional[PackageDifficultyEnum] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PackageListResponseModel(BaseModel):
    packages: List[PackageResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int


class PackageDetailResponseModel(PackageResponseModel):
    """Detailed package response with additional relationship data"""
    # Add relationship data when needed
    destination_name: Optional[str] = None
    trip_type_name: Optional[str] = None
    offer_title: Optional[str] = None


