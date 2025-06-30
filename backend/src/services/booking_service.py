from typing import Optional, List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime
import uuid

from ..models.booking import Booking
from ..schemas.booking_schemas import BookingCreateModel, BookingUpdateModel, BookingResponseModel, BookingStatusUpdateModel
from .promo_code_service import PromoCodeService


class BookingService:
    async def get_bookings(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get paginated list of bookings with filtering"""
        
        # Build the query
        statement = select(Booking)
        
        # Add filters
        if status:
            statement = statement.where(Booking.status == status)
        
        if user_id:
            statement = statement.where(Booking.user_id == user_id)
        
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (Booking.customer_name.ilike(search_term)) |
                (Booking.customer_email.ilike(search_term)) |
                (Booking.id.ilike(search_term))
            )
        
        # Get total count
        count_statement = select(func.count(Booking.id))
        if statement.whereclause is not None:
            count_statement = count_statement.where(*statement.whereclause.clauses)
        
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        
        # Add pagination and ordering
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Booking.created_at.desc())
        
        # Execute query
        result = await session.exec(statement)
        bookings = result.all()
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        return {
            "bookings": [BookingResponseModel.model_validate(booking) for booking in bookings],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    async def get_booking_by_id(self, session: AsyncSession, booking_id: str) -> Optional[Booking]:
        """Get a single booking by ID"""
        statement = select(Booking).where(Booking.id == booking_id)
        result = await session.exec(statement)
        return result.first()
    
    async def validate_promo_code(
        self,
        session: AsyncSession,
        code: Optional[str] = None,
        promo_code_id: Optional[str] = None,
        booking_amount: float = 0.0,
        package_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validate a promo code for a booking"""
        
        # Convert async session to sync session for promo code service
        sync_session = session.sync_session
        
        # Convert string IDs to UUID if needed
        promo_uuid = None
        package_uuid = None
        
        if promo_code_id:
            try:
                promo_uuid = uuid.UUID(promo_code_id)
            except ValueError:
                return {
                    "is_valid": False,
                    "message": "Invalid promo code ID format",
                    "discount_amount": 0.0,
                    "final_amount": booking_amount
                }
        
        if package_id:
            try:
                package_uuid = uuid.UUID(package_id)
            except ValueError:
                package_uuid = None
        
        validation_result = PromoCodeService.validate_promo_code(
            session=sync_session,
            code=code,
            promo_code_id=promo_uuid,
            booking_amount=booking_amount,
            package_id=package_uuid
        )
        
        return validation_result.model_dump()

    async def create_booking(
        self,
        session: AsyncSession,
        booking_data: BookingCreateModel,
        user_id: str
    ) -> Booking:
        """Create a new booking"""
        
        # Generate booking ID
        booking_id = f"BKG-{uuid.uuid4().hex[:6].upper()}"
        
        # Handle promo code validation if provided
        promo_code_id = None
        discount_amount = 0.0
        final_amount = booking_data.total_amount
        
        if booking_data.promo_code or booking_data.promo_code_id:
            # Convert async session to sync session for promo code service
            # Note: This is a temporary solution. Ideally, make PromoCodeService async
            sync_session = session.sync_session
            
            validation_result = PromoCodeService.validate_promo_code(
                session=sync_session,
                code=booking_data.promo_code,
                promo_code_id=booking_data.promo_code_id,
                booking_amount=booking_data.total_amount
            )
            
            if validation_result.is_valid and validation_result.promo_code_id:
                promo_code_id = validation_result.promo_code_id
                discount_amount = validation_result.discount_amount or 0.0
                final_amount = validation_result.final_amount or booking_data.total_amount
                
                # Mark promo code as used
                PromoCodeService.use_promo_code(sync_session, promo_code_id)
        
        # Create booking object
        booking_dict = booking_data.model_dump(exclude={'promo_code'})  # Exclude promo_code string
        booking_dict.update({
            "id": booking_id,
            "user_id": user_id,
            "promo_code_id": promo_code_id,
            "discount_amount": discount_amount,
            "total_amount": final_amount,  # Use discounted amount as total
            "paid_amount": 0.0  # Initially unpaid
        })
        
        new_booking = Booking(**booking_dict)
        
        # Save to database
        session.add(new_booking)
        await session.commit()
        await session.refresh(new_booking)
        
        return new_booking
    
    async def update_booking(
        self,
        session: AsyncSession,
        booking_id: str,
        booking_data: BookingUpdateModel
    ) -> Optional[Booking]:
        """Update an existing booking"""
        
        # Get existing booking
        booking = await self.get_booking_by_id(session, booking_id)
        if not booking:
            return None
        
        # Update fields
        update_data = booking_data.model_dump(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            if hasattr(booking, field):
                setattr(booking, field, value)
        
        # Update timestamp
        booking.updated_at = datetime.now()
        
        # Save changes
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        
        return booking
    
    async def update_booking_status(
        self,
        session: AsyncSession,
        booking_id: str,
        status_data: BookingStatusUpdateModel
    ) -> Optional[Booking]:
        """Update booking status"""
        
        booking = await self.get_booking_by_id(session, booking_id)
        if not booking:
            return None
        
        booking.status = status_data.status
        booking.updated_at = datetime.now()
        
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        
        return booking
    
    async def delete_booking(self, session: AsyncSession, booking_id: str) -> bool:
        """Delete a booking"""
        
        booking = await self.get_booking_by_id(session, booking_id)
        if not booking:
            return False
        
        # Delete from database
        await session.delete(booking)
        await session.commit()
        
        return True
    
    async def get_booking_stats(self, session: AsyncSession) -> Dict[str, int]:
        """Get booking statistics by status"""
        
        # Get booking counts by status
        from ..models.booking import BookingStatus
        
        stats = {}
        for status in BookingStatus:
            count_result = await session.exec(
                select(func.count(Booking.id)).where(Booking.status == status.value)
            )
            stats[status.value] = count_result.first() or 0
        
        return stats


# Create singleton instance
booking_service = BookingService()
