from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class BookingCreateModel(BaseModel):
    """Schema for creating a booking"""
    package_id: uuid.UUID
    total_amount: float = Field(gt=0)
    promo_code_id: Optional[uuid.UUID] = None
    promo_code: Optional[str] = Field(None, min_length=1, max_length=50)
    
    # Payment data for initial payment record
    discount_amount: float = Field(ge=0, default=0.0)
    tax_amount: float = Field(ge=0, default=0.0)
    initial_payment: float = Field(ge=0, default=0.0)
    
    @validator('promo_code')
    def validate_promo_code(cls, v, values):
        if v is not None and values.get('promo_code_id') is not None:
            raise ValueError('Cannot provide both promo_code and promo_code_id')
        return v


class PromoValidationRequest(BaseModel):
    code: Optional[str] = None
    promo_code_id: Optional[uuid.UUID] = None
    booking_amount: float = Field(gt=0)
    package_id: Optional[uuid.UUID] = None


class PromoValidationResponse(BaseModel):
    valid: bool
    promo_code_id: Optional[uuid.UUID] = None
    discount_amount: float = 0.0
    discount_percentage: Optional[float] = None
    final_amount: float
    message: str
    promo_code: Optional[str] = None


class BookingUpdateModel(BaseModel):
    """Schema for updating a booking"""
    status: Optional[BookingStatus] = None
    payment_status: Optional[PaymentStatus] = None
    cancellation_reason: Optional[str] = None


class BookingStatusUpdateModel(BaseModel):
    status: BookingStatus


class PaymentRequestModel(BaseModel):
    """Schema for processing payments"""
    payment_amount: float = Field(gt=0)
    payment_method: Optional[str] = "card"
    payment_reference: Optional[str] = None


class BookingResponseModel(BaseModel):
    """Basic booking response model"""
    id: uuid.UUID
    package_id: uuid.UUID
    user_id: uuid.UUID
    promo_code_id: Optional[uuid.UUID] = None
    status: str
    payment_status: str
    total_amount: float
    paid_amount: float
    discount_amount: float
    booking_date: Optional[datetime] = None
    cancellation_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Package information (joined from backend)
    packageTitle: Optional[str] = None
    packageDescription: Optional[str] = None
    packagePrice: Optional[float] = None
    
    # User information (joined from backend)
    user: Optional[dict] = None
    
    class Config:
        from_attributes = True


class BookingDetailResponseModel(BookingResponseModel):
    """Detailed booking response with enhanced information"""
    
    # These fields are now directly on the booking model
    outstanding_amount: Optional[float] = None
    is_fully_paid: Optional[bool] = None


class BookingListResponseModel(BaseModel):
    """Response model for paginated booking lists"""
    bookings: list[BookingResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int

