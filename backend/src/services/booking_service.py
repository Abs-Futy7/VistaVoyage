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
        """Create a new booking with normalized payment structure"""
        
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
        
        # Create booking object - only basic booking info
        booking_dict = booking_data.model_dump(exclude={'promo_code', 'payment_method', 'payment_status'})
        booking_dict.update({
            "user_id": user_id,
            "promo_code_id": promo_code_id,
            "discount_amount": discount_amount,
            "total_amount": final_amount,  # Use discounted amount as total
        })
        
        new_booking = Booking(**booking_dict)
        
        # Save booking with all payment info
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
        
        # Save changes (updated_at will be handled by database onupdate)
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
        # updated_at will be handled by database onupdate
        
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
    
    async def get_booking_stats_by_status(self, session: AsyncSession) -> Dict[str, int]:
        """Get basic booking statistics by status"""
        
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
        
        print(f"[make_payment] Looking for booking: {booking_id}")
        booking = await self.get_booking_by_id(session, booking_id)
        if not booking:
            print(f"[make_payment] Booking not found: {booking_id}")
            return None
        
        print(f"[make_payment] Found booking. Status: {booking.status}, Payment status: {booking.payment_status}")
        print(f"[make_payment] Booking user_id: {booking.user_id}, Provided user_id: {user_id}")
        
        # Verify booking belongs to the user
        if str(booking.user_id) != str(user_id):
            print(f"[make_payment] User ID mismatch")
            return None
        
        # Check if payment is already made
        if booking.payment_status not in ['pending', 'partially_paid']:
            print(f"[make_payment] Payment status not valid for payment: {booking.payment_status}")
            return None
        
        # Check if booking is in a valid state for payment
        if booking.status in ['cancelled', 'refunded']:
            print(f"[make_payment] Booking status not valid for payment: {booking.status}")
            return None
        
        # Update payment details
        payment_amount = Decimal(str(payment_data.get('payment_amount', 0.0)))
        print(f"[make_payment] Processing payment amount: {payment_amount}")
        booking.paid_amount += payment_amount
        booking.payment_status = 'paid' if booking.paid_amount >= booking.total_amount else 'partially_paid'
        
        print(f"[make_payment] Updated paid_amount: {booking.paid_amount}, New payment_status: {booking.payment_status}")
        
        # updated_at will be handled by database onupdate
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        
        return booking
    
    async def get_booking_with_payment(
        self,
        session: AsyncSession,
        booking_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get booking details with payment information from normalized tables"""
        try:
            booking_uuid = uuid.UUID(booking_id)
        except ValueError:
            return None
        
        # Get booking
        query = select(Booking).where(Booking.id == booking_uuid)
        if user_id:
            query = query.where(Booking.user_id == user_id)
        
        result = await session.exec(query)
        booking = result.first()
        
        if not booking:
            return None
        
        # Convert booking to dict - payment info is now directly on booking
        booking_dict = BookingResponseModel.model_validate(booking).model_dump()
        
        return booking_dict

    async def get_booking_stats(self, session: AsyncSession, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive booking statistics for admin dashboard or user profile"""
        # Base queries
        total_query = select(func.count(Booking.id))
        
        if user_id:
            total_query = total_query.where(Booking.user_id == user_id)
        
        total_result = await session.exec(total_query)
        total_bookings = total_result.one()
        
        # Bookings by status
        status_query = select(Booking.status, func.count(Booking.id)).group_by(Booking.status)
        if user_id:
            status_query = status_query.where(Booking.user_id == user_id)
        
        status_result = await session.exec(status_query)
        bookings_by_status = {status: count for status, count in status_result.all()}
        
        # Revenue calculations (only for admin)
        stats = {
            "total_bookings": total_bookings,
            "bookings_by_status": bookings_by_status
        }
        
        if not user_id:  # Admin stats
            # Calculate revenue manually to avoid casting issues
            from decimal import Decimal
            
            # Get all confirmed bookings
            confirmed_bookings_query = select(Booking).where(Booking.status == 'confirmed')
            result = await session.exec(confirmed_bookings_query)
            confirmed_bookings = result.all()
            
            # Calculate total revenue manually
            total_revenue = sum((Decimal(str(booking.total_amount)) for booking in confirmed_bookings), Decimal('0'))
            
            stats["total_revenue"] = float(total_revenue)
        
        return stats


# Create singleton instance
booking_service = BookingService()
