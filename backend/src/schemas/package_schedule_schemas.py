"""
Schemas for package schedule operations
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class PackageScheduleCreateModel(BaseModel):
    """Schema for creating package schedule"""
    package_id: uuid.UUID
    duration_days: int = Field(gt=0, description="Number of days for the package")
    duration_nights: int = Field(ge=0, description="Number of nights for the package")
    max_group_size: Optional[int] = Field(None, gt=0, description="Maximum group size")
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class PackageScheduleUpdateModel(BaseModel):
    """Schema for updating package schedule"""
    duration_days: Optional[int] = Field(None, gt=0, description="Number of days")
    duration_nights: Optional[int] = Field(None, ge=0, description="Number of nights")
    max_group_size: Optional[int] = Field(None, gt=0, description="Maximum group size")
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class PackageScheduleResponseModel(BaseModel):
    """Schema for package schedule response"""
    id: uuid.UUID
    package_id: uuid.UUID
    duration_days: int
    duration_nights: int
    max_group_size: Optional[int]
    available_from: Optional[datetime]
    available_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScheduleSummaryModel(BaseModel):
    """Schema for schedule summary information"""
    duration_days: int
    duration_nights: int
    max_group_size: Optional[int]
    is_available: bool
