from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from .package import Package
    from .promo_code import PromoCode
    from ..auth.models import User
    from .booking_payment import BookingPayment


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


class Booking(SQLModel, table=True):
    """Booking model for travel package bookings."""
    __tablename__ = "bookings"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    package_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("packages.id"),
            nullable=False
        )
    )
    
    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.uid"),
            nullable=False
        )
    )
    
    promo_code_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("promo_codes.id"),
            nullable=True
        )
    )
    
    status: str = Field(
        default=BookingStatus.PENDING,
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=False,
            default=BookingStatus.PENDING
        )
    )
    
    payment_status: str = Field(
        default=PaymentStatus.PENDING,
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=False,
            default=PaymentStatus.PENDING
        )
    )
    

    
    
    booking_date: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            nullable=False
        )
    )
    
    cancellation_date: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
        )
    )
    
    cancellation_reason: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            onupdate=datetime.now,
            nullable=False
        )
    )
    
    # Relationships
    package: "Package" = Relationship(back_populates="bookings")
    user: "User" = Relationship(back_populates="bookings")
    promo_code: Optional["PromoCode"] = Relationship(back_populates="bookings")
    payment: Optional["BookingPayment"] = Relationship(back_populates="booking", cascade_delete=True)

    def __repr__(self):
        return f"<Booking {self.id} - User: {self.user_id}>"

    @property
    def outstanding_amount(self) -> float:
        """Calculate the outstanding amount to be paid."""
        return self.payment.outstanding_amount if self.payment else 0.0

    @property
    def is_fully_paid(self) -> bool:
        """Check if the booking is fully paid."""
        return self.payment.is_fully_paid if self.payment else False

    @property
    def total_amount(self) -> float:
        """Get the total amount for this booking."""
        return self.payment.total_amount if self.payment else 0.0

    @property
    def paid_amount(self) -> float:
        """Get the paid amount for this booking."""
        return self.payment.paid_amount if self.payment else 0.0
