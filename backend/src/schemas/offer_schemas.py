from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class OfferCreateModel(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    discount_percentage: Optional[float] = Field(None, ge=0, le=100)
    discount_amount: Optional[float] = Field(None, ge=0)
    max_usage_per_user: Optional[int] = Field(None, ge=0)
    total_usage_limit: Optional[int] = Field(None, ge=0)
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True


class OfferUpdateModel(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    discount_percentage: Optional[float] = Field(None, ge=0, le=100)
    discount_amount: Optional[float] = Field(None, ge=0)
    max_usage_per_user: Optional[int] = Field(None, ge=0)
    total_usage_limit: Optional[int] = Field(None, ge=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class OfferResponseModel(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    discount_percentage: Optional[float] = None
    discount_amount: Optional[float] = None
    max_usage_per_user: Optional[int] = None
    total_usage_limit: Optional[int] = None
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OfferListResponseModel(BaseModel):
    offers: List[OfferResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int
