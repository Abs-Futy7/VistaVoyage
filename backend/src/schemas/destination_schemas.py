from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class DestinationCreateModel(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    country: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=100)
    best_time_to_visit: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=50)
    featured_image: Optional[str] = None
    is_active: bool = True


class DestinationUpdateModel(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    best_time_to_visit: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=50)
    featured_image: Optional[str] = None
    is_active: Optional[bool] = None


class DestinationResponseModel(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    country: str
    city: str
    best_time_to_visit: Optional[str] = None
    timezone: Optional[str] = None
    featured_image: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DestinationListResponseModel(BaseModel):
    destinations: List[DestinationResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int
