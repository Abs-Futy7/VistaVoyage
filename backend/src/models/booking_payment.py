from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .booking import Booking


class BookingPayment(SQLModel, table=True):
    """Normalized payment information for bookings."""
    __tablename__ = "booking_payments"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    booking_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("bookings.id", ondelete="CASCADE"),
            nullable=False,
            unique=True  # One-to-one relationship
        )
    )
    
    total_amount: float = Field(
        sa_column=Column(
            pg.NUMERIC(10, 2),
            nullable=False
        )
    )
    
    paid_amount: float = Field(
        default=0.0,
        sa_column=Column(
            pg.NUMERIC(10, 2),
            nullable=False,
            default=0.0
        )
    )
    
    discount_amount: float = Field(
        default=0.0,
        sa_column=Column(
            pg.NUMERIC(10, 2),
            nullable=False,
            default=0.0
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
    booking: "Booking" = Relationship(back_populates="payment")

    def __repr__(self):
        return f"<BookingPayment {self.total_amount} {self.currency} for Booking {self.booking_id}>"
    
    @property
    def outstanding_amount(self) -> float:
        """Calculate the outstanding amount to be paid."""
        return max(0, self.total_amount - self.paid_amount)

    @property
    def is_fully_paid(self) -> bool:
        """Check if the booking is fully paid."""
        return self.paid_amount >= self.total_amount
    
    @property
    def net_amount(self) -> float:
        """Calculate the net amount after discount."""
        return self.total_amount - self.discount_amount
