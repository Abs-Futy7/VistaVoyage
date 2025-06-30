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
    
    class Config:
        from_attributes = True


class PackageListResponseModel(BaseModel):
    packages: List[PackageResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int


class PackageDetailResponseModel(PackageResponseModel):
    """Detailed package response with additional information"""
    # This will include the full package data plus any relationships loaded
    pass


