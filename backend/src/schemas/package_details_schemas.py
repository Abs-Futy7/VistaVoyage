"""
Schemas for package details operations
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class PackageDetailsCreateModel(BaseModel):
    """Schema for creating package details"""
    package_id: uuid.UUID
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None


class PackageDetailsUpdateModel(BaseModel):
    """Schema for updating package details"""
    highlights: Optional[str] = None
    itinerary: Optional[str] = None
    inclusions: Optional[str] = None
    exclusions: Optional[str] = None
    terms_conditions: Optional[str] = None


class PackageDetailsResponseModel(BaseModel):
    """Schema for package details response"""
    id: uuid.UUID
    package_id: uuid.UUID
    highlights: Optional[str]
    itinerary: Optional[str]
    inclusions: Optional[str]
    exclusions: Optional[str]
    terms_conditions: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
