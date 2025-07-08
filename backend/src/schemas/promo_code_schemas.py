from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
import uuid


class PromoCodeCreateModel(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(default="percentage", pattern="^(percentage|fixed)$")
    discount_value: float = Field(gt=0)
    minimum_amount: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    start_date: date
    expiry_date: date
    usage_limit: Optional[int] = Field(None, ge=1)
    is_active: bool = True
    
    # Optional offer relationship for backward compatibility
    offer_id: Optional[uuid.UUID] = None
    
    @field_validator('expiry_date')
    @classmethod
    def expiry_date_must_be_after_start_date(cls, v, info):
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('Expiry date must be after start date')
        return v
    
    @field_validator('code')
    @classmethod
    def code_must_be_uppercase(cls, v):
        return v.upper().strip()


class PromoCodeUpdateModel(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    discount_type: Optional[str] = Field(None, pattern="^(percentage|fixed)$")
    discount_value: Optional[float] = Field(None, gt=0)
    minimum_amount: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    expiry_date: Optional[date] = None
    usage_limit: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    offer_id: Optional[uuid.UUID] = None
    
    @field_validator('code')
    @classmethod
    def code_must_be_uppercase(cls, v):
        if v is not None:
            return v.upper().strip()
        return v


class PromoCodeResponseModel(BaseModel):
    id: uuid.UUID
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    minimum_amount: Optional[float] = None
    maximum_discount: Optional[float] = None
    start_date: date
    expiry_date: date
    usage_limit: Optional[int] = None
    used_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Legacy fields for backward compatibility
    offer_id: Optional[uuid.UUID] = None
    max_usage: Optional[int] = None
    # Computed fields
    remaining_uses: Optional[int] = None
    is_valid: bool = True
    is_expired: bool = False
    
    class Config:
        from_attributes = True


class PromoCodeListResponseModel(BaseModel):
    promo_codes: List[PromoCodeResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int


class PromoCodeValidationModel(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    promo_code_id: Optional[uuid.UUID] = None
    booking_amount: float = Field(gt=0)
    package_id: Optional[uuid.UUID] = None
    group_size: Optional[int] = Field(None, ge=1)


class PromoCodeValidationResponseModel(BaseModel):
    is_valid: bool
    discount_amount: Optional[float] = None
    discount_percentage: Optional[float] = None
    final_amount: Optional[float] = None
    message: str
    promo_code_id: Optional[uuid.UUID] = None
    offer_title: Optional[str] = None
    remaining_uses: Optional[int] = None
