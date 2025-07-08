"""
Service for booking payment operations
"""
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional, Dict, Any
import uuid

from ..models.booking_payment import BookingPayment
from ..models.booking import Booking
from ..schemas.booking_payment_schemas import (
    BookingPaymentCreateModel,
    BookingPaymentUpdateModel,
    PaymentSummaryModel
)


class BookingPaymentService:
    """Service class for booking payment operations"""

    async def create_payment(
        self,
        session: AsyncSession,
        payment_data: BookingPaymentCreateModel
    ) -> BookingPayment:
        """Create a new booking payment record"""
        
        # Verify booking exists
        booking_statement = select(Booking).where(Booking.id == payment_data.booking_id)
        booking_result = await session.exec(booking_statement)
        booking = booking_result.first()
        
        if not booking:
            raise ValueError("Booking not found")
        
        # Check if payment already exists for this booking
        existing_statement = select(BookingPayment).where(
            BookingPayment.booking_id == payment_data.booking_id
        )
        existing_result = await session.exec(existing_statement)
        existing_payment = existing_result.first()
        
        if existing_payment:
            raise ValueError("Payment record already exists for this booking")
        
        # Create new payment record
        payment = BookingPayment(
            booking_id=payment_data.booking_id,
            total_amount=payment_data.total_amount,
            paid_amount=payment_data.paid_amount,
            discount_amount=payment_data.discount_amount,
            tax_amount=payment_data.tax_amount,
            currency=payment_data.currency
        )
        
        session.add(payment)
        await session.commit()
        await session.refresh(payment)
        
        return payment

    async def get_payment_by_booking_id(
        self,
        session: AsyncSession,
        booking_id: uuid.UUID
    ) -> Optional[BookingPayment]:
        """Get payment record by booking ID"""
        statement = select(BookingPayment).where(BookingPayment.booking_id == booking_id)
        result = await session.exec(statement)
        return result.first()

    async def update_payment(
        self,
        session: AsyncSession,
        payment_id: uuid.UUID,
        payment_data: BookingPaymentUpdateModel
    ) -> Optional[BookingPayment]:
        """Update an existing payment record"""
        statement = select(BookingPayment).where(BookingPayment.id == payment_id)
        result = await session.exec(statement)
        payment = result.first()
        
        if not payment:
            return None
        
        # Update fields if provided
        if payment_data.paid_amount is not None:
            payment.paid_amount = payment_data.paid_amount
        if payment_data.discount_amount is not None:
            payment.discount_amount = payment_data.discount_amount
        if payment_data.tax_amount is not None:
            payment.tax_amount = payment_data.tax_amount
        
        await session.commit()
        await session.refresh(payment)
        
        return payment

    async def process_payment(
        self,
        session: AsyncSession,
        booking_id: uuid.UUID,
        payment_amount: float
    ) -> Optional[BookingPayment]:
        """Process a payment for a booking"""
        payment = await self.get_payment_by_booking_id(session, booking_id)
        
        if not payment:
            raise ValueError("Payment record not found for booking")
        
        # Add to paid amount
        payment.paid_amount += payment_amount
        
        # Ensure paid amount doesn't exceed total
        if payment.paid_amount > payment.total_amount:
            payment.paid_amount = payment.total_amount
        
        await session.commit()
        await session.refresh(payment)
        
        return payment

    async def get_payment_summary(
        self,
        session: AsyncSession,
        booking_id: uuid.UUID
    ) -> Optional[PaymentSummaryModel]:
        """Get payment summary for a booking"""
        payment = await self.get_payment_by_booking_id(session, booking_id)
        
        if not payment:
            return None
        
        return PaymentSummaryModel(
            total_amount=payment.total_amount,
            paid_amount=payment.paid_amount,
            outstanding_amount=payment.outstanding_amount,
            discount_amount=payment.discount_amount,
            tax_amount=payment.tax_amount,
            currency=payment.currency,
            is_fully_paid=payment.is_fully_paid
        )


# Create service instance
booking_payment_service = BookingPaymentService()
