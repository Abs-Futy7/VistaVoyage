"""
Schemas for booking payment operations
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class BookingPaymentCreateModel(BaseModel):
    """Schema for creating a booking payment"""
    booking_id: uuid.UUID
    total_amount: float = Field(gt=0, description="Total amount for the booking")
    paid_amount: float = Field(ge=0, default=0.0, description="Amount already paid")
    discount_amount: float = Field(ge=0, default=0.0, description="Discount amount applied")
    tax_amount: float = Field(ge=0, default=0.0, description="Tax amount")
    currency: str = Field(default="USD", description="Currency code")


class BookingPaymentUpdateModel(BaseModel):
    """Schema for updating a booking payment"""
    paid_amount: Optional[float] = Field(None, ge=0, description="Amount paid")
    discount_amount: Optional[float] = Field(None, ge=0, description="Discount amount")
    tax_amount: Optional[float] = Field(None, ge=0, description="Tax amount")


class BookingPaymentResponseModel(BaseModel):
    """Schema for booking payment response"""
    id: uuid.UUID
    booking_id: uuid.UUID
    total_amount: float
    paid_amount: float
    discount_amount: float
    tax_amount: float
    currency: str
    outstanding_amount: float
    is_fully_paid: bool
    net_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentSummaryModel(BaseModel):
    """Schema for payment summary information"""
    total_amount: float
    paid_amount: float
    outstanding_amount: float
    discount_amount: float
    tax_amount: float
    currency: str
    is_fully_paid: bool
