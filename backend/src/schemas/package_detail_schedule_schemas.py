from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class PackageDetailScheduleCreateModel(BaseModel):
    package_id: uuid.UUID
    # Details fields
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    # Schedule fields
    duration_days: int = Field(gt=0)
    duration_nights: int = Field(ge=0)
    max_group_size: Optional[int] = Field(None, gt=0)
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None

class PackageDetailScheduleUpdateModel(BaseModel):
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None
    duration_days: Optional[int] = Field(None, gt=0)
    duration_nights: Optional[int] = Field(None, ge=0)
    max_group_size: Optional[int] = Field(None, gt=0)
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None

class PackageDetailScheduleResponseModel(BaseModel):
    package_id: uuid.UUID
    highlights: Optional[str]
    itinerary: Optional[str]
    inclusions: Optional[str]
    exclusions: Optional[str]
    terms_conditions: Optional[str]
    duration_days: int
    duration_nights: int
    max_group_size: Optional[int]
    available_from: Optional[datetime]
    available_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
