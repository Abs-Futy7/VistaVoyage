from typing import Optional, List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime
from decimal import Decimal
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
        """Get paginated list of bookings with filtering and joined data"""
        from ..auth.models import User
        from ..models.package import Package
        
        # Build the query with joins for package and user data
        statement = select(Booking, User, Package).join(
            User, Booking.user_id == User.uid
        ).join(
            Package, Booking.package_id == Package.id
        )
        
        count_statement = select(func.count(Booking.id))
        
        # Add filters to both statements
        if status:
            statement = statement.where(Booking.status == status)
            count_statement = count_statement.where(Booking.status == status)
        
        if user_id:
            statement = statement.where(Booking.user_id == user_id)
            count_statement = count_statement.where(Booking.user_id == user_id)
        
        if search:
            # Search in booking ID, package title, or user name
            search_condition = (
                Booking.id.ilike(f"%{search}%") |
                Package.title.ilike(f"%{search}%") |
                User.full_name.ilike(f"%{search}%")
            )
            statement = statement.where(search_condition)
            count_statement = count_statement.where(search_condition)
        
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        
        # Add pagination and ordering
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Booking.created_at.desc())
        
        # Execute query
        result = await session.exec(statement)
        booking_data = result.all()
        
        # Format the results with joined data
        bookings_with_details = []
        for booking, user, package in booking_data:
            booking_dict = {
                "id": str(booking.id),
                "package_id": str(booking.package_id),
                "user_id": str(booking.user_id),
                "promo_code_id": str(booking.promo_code_id) if booking.promo_code_id else None,
                "status": booking.status,
                "payment_status": booking.payment_status,
                "total_amount": float(booking.total_amount),
                "paid_amount": float(booking.paid_amount),
                "discount_amount": float(booking.discount_amount),
                "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
                "cancellation_date": booking.cancellation_date.isoformat() if booking.cancellation_date else None,
                "cancellation_reason": booking.cancellation_reason,
                "created_at": booking.created_at.isoformat(),
                "updated_at": booking.updated_at.isoformat(),
                
                # Package information
                "packageTitle": package.title,
                "packageDescription": package.description,
                "packagePrice": float(package.price),
                
                # User information
                "user": {
                    "id": str(user.uid),
                    "fullName": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "city": user.city,
                    "country": user.country,
                    "createdAt": user.created_at.isoformat()
                }
            }
            bookings_with_details.append(booking_dict)
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        return {
            "bookings": bookings_with_details,
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
    
    async def get_booking_details_for_admin(self, session: AsyncSession, booking_id: str) -> Optional[Dict[str, Any]]:
        """Get booking details with user and package information for admin panel"""
        from ..auth.models import User
        from ..models.package import Package
        
        # Join booking with user and package data
        statement = select(Booking, User, Package).join(
            User, Booking.user_id == User.uid
        ).join(
            Package, Booking.package_id == Package.id
        ).where(Booking.id == booking_id)
        
        result = await session.exec(statement)
        booking_data = result.first()
        
        if not booking_data:
            return None
        
        booking, user, package = booking_data
        
        # Format response with all necessary data
        return {
            "id": str(booking.id),
            "package_id": str(booking.package_id),
            "user_id": str(booking.user_id),
            "promo_code_id": str(booking.promo_code_id) if booking.promo_code_id else None,
            "status": booking.status,
            "payment_status": booking.payment_status,
            "total_amount": float(booking.total_amount),
            "paid_amount": float(booking.paid_amount),
            "discount_amount": float(booking.discount_amount),
            "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
            "cancellation_date": booking.cancellation_date.isoformat() if booking.cancellation_date else None,
            "cancellation_reason": booking.cancellation_reason,
            "created_at": booking.created_at.isoformat(),
            "updated_at": booking.updated_at.isoformat(),
            
            # Package information
            "packageTitle": package.title,
            "packageDescription": package.description,
            "packagePrice": float(package.price),
            
            # User information
            "user": {
                "id": str(user.uid),
                "fullName": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "city": user.city,
                "country": user.country,
                "dateOfBirth": None,  # User model doesn't have date_of_birth field
                "createdAt": user.created_at.isoformat()
            }
        }
    
    async def validate_promo_code(
        self,
        session: AsyncSession,
        code: Optional[str] = None,
        promo_code_id: Optional[str] = None,
        booking_amount: float = 0.0,
        package_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validate a promo code for a booking"""
        
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
        
        validation_result = await PromoCodeService.validate_promo_code(
            session=session,
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
        
        # Generate a proper UUID for booking ID
        # Note: ID will be auto-generated by the model's default_factory
        
        # Handle promo code validation if provided
        promo_code_id = None
        discount_amount = 0.0
        final_amount = booking_data.total_amount
        
        if booking_data.promo_code or booking_data.promo_code_id:
            # Convert string IDs to UUID if needed
            promo_uuid = None
            if booking_data.promo_code_id:
                try:
                    promo_uuid = uuid.UUID(booking_data.promo_code_id)
                except ValueError:
                    promo_uuid = None
            
            validation_result = await PromoCodeService.validate_promo_code(
                session=session,
                code=booking_data.promo_code,
                promo_code_id=promo_uuid,
                booking_amount=booking_data.total_amount
            )
            
            if validation_result.is_valid and validation_result.promo_code_id:
                promo_code_id = validation_result.promo_code_id
                discount_amount = validation_result.discount_amount or 0.0
                final_amount = validation_result.final_amount or booking_data.total_amount
                
                # Mark promo code as used (use sync session for this specific call)
                PromoCodeService.use_promo_code(session.sync_session, promo_code_id)
        
        # Create booking object - ID will be auto-generated by the model
        booking_dict = booking_data.model_dump(exclude={'promo_code'})  # Exclude promo_code string
        booking_dict.update({
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
    
    async def make_payment(
        self,
        session: AsyncSession,
        booking_id: str,
        payment_data: Dict[str, Any],
        user_id: str
    ) -> Optional[Booking]:
        """Process payment for a booking"""
        
        booking = await self.get_booking_by_id(session, booking_id)
        if not booking:
            return None
        
        # Verify booking belongs to the user
        if str(booking.user_id) != str(user_id):
            return None
        
        # Check if payment is already made
        if booking.payment_status != 'pending':
            return None
        
        # Update payment details
        payment_amount = Decimal(str(payment_data.get('amount', 0.0)))
        booking.paid_amount += payment_amount
        booking.payment_status = 'completed' if booking.paid_amount >= booking.total_amount else 'partial'
        
        # Update timestamp
        booking.updated_at = datetime.now()
        
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        
        return booking


# Create singleton instance
booking_service = BookingService()
