from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid


class BookingStatusEnum(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class BookingCreateModel(BaseModel):
    package_id: uuid.UUID
    total_amount: float = Field(gt=0)
    promo_code_id: Optional[uuid.UUID] = None
    promo_code: Optional[str] = Field(None, min_length=1, max_length=50)
    
    @validator('promo_code')
    def validate_promo_code(cls, v, values):
        if v is not None and values.get('promo_code_id') is not None:
            raise ValueError('Cannot provide both promo_code and promo_code_id')
        return v


class BookingUpdateModel(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    total_amount: Optional[float] = Field(None, gt=0)
    paid_amount: Optional[float] = Field(None, ge=0)
    discount_amount: Optional[float] = Field(None, ge=0)
    cancellation_reason: Optional[str] = None


class BookingStatusUpdateModel(BaseModel):
    status: str = Field(min_length=1, max_length=20)


class BookingResponseModel(BaseModel):
    id: uuid.UUID
    package_id: uuid.UUID
    user_id: uuid.UUID
    promo_code_id: Optional[uuid.UUID] = None
    status: str
    payment_status: str
    total_amount: float
    paid_amount: float
    discount_amount: float
    booking_date: datetime
    cancellation_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BookingListResponseModel(BaseModel):
    bookings: list[BookingResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int
