"""
User booking routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...schemas.booking_schemas import (
    BookingCreateModel, 
    BookingUpdateModel, 
    BookingResponseModel, 
    BookingListResponseModel,
    BookingStatusUpdateModel,
    PaymentRequestModel
)
from ...services.booking_service import booking_service
from ...auth.dependencies import get_current_user

booking_router = APIRouter()

@booking_router.post("/bookings", response_model=BookingResponseModel)
async def create_booking(
    booking_data: BookingCreateModel,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Create a new booking with optional promo code.
    
    The booking can include either a promo code string or promo code ID.
    The system will automatically validate and apply discounts.
    """
    try:
        booking = await booking_service.create_booking(
            session=session,
            booking_data=booking_data,
            user_id=str(current_user.uid)
        )
        
        # Get detailed booking information with user and package data
        booking_details = await booking_service.get_booking_details_for_admin(
            session=session,
            booking_id=str(booking.id)
        )
        
        if not booking_details:
            raise HTTPException(
                status_code=500,
                detail="Error retrieving created booking details"
            )
        
        return BookingResponseModel.model_validate(booking_details)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating booking: {str(e)}"
        )


@booking_router.get("/bookings", response_model=BookingListResponseModel)
async def get_user_bookings(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of items per page"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Get user's bookings with pagination and filtering"""
    try:
        result = await booking_service.get_bookings(
            session=session,
            page=page,
            limit=limit,
            status=status,
            user_id=str(current_user.uid)
        )
        
        return BookingListResponseModel(
            bookings=result["bookings"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            total_pages=result["total_pages"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching bookings: {str(e)}"
        )


@booking_router.post("/bookings/validate-promo")
async def validate_promo_for_booking(
    code: Optional[str] = None,
    promo_code_id: Optional[str] = None,
    booking_amount: float = Query(gt=0),
    package_id: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Validate a promo code for a potential booking.
    
    This endpoint allows users to check if a promo code is valid
    before actually creating a booking.
    """
    try:
        result = await booking_service.validate_promo_code(
            session=session,
            code=code,
            promo_code_id=promo_code_id,
            booking_amount=booking_amount,
            package_id=package_id
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating promo code: {str(e)}"
        )


@booking_router.get("/bookings/{booking_id}", response_model=BookingResponseModel)
async def get_booking(
    booking_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Get a specific booking by ID"""
    try:
        booking = await booking_service.get_booking_by_id(session, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Check if booking belongs to current user
        if str(booking.user_id) != str(current_user.uid):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        return BookingResponseModel.model_validate(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching booking: {str(e)}"
        )

@booking_router.patch("/bookings/{booking_id}/payment")
async def make_payment(
    booking_id: str,
    payment_data: PaymentRequestModel,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Make a payment for a booking"""
    try:
        print(f"Processing payment for booking: {booking_id}")
        print(f"User ID: {current_user.uid}")
        print(f"Payment data: {payment_data.model_dump()}")
        
        # First check if booking exists and get detailed info
        booking_check = await booking_service.get_booking_by_id(session, booking_id)
        if not booking_check:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Check if booking belongs to current user
        if str(booking_check.user_id) != str(current_user.uid):
            raise HTTPException(
                status_code=403,
                detail="Not authorized to make payment for this booking"
            )
        
        # Check if booking status allows payment
        if booking_check.status in ['cancelled', 'refunded']:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot make payment for {booking_check.status} booking"
            )
        
        # Check if payment status allows payment
        if booking_check.payment_status not in ['pending', 'partially_paid']:
            raise HTTPException(
                status_code=400,
                detail=f"Payment already {booking_check.payment_status}"
            )
        
        booking = await booking_service.make_payment(
            session=session,
            booking_id=booking_id,
            payment_data=payment_data.model_dump(),
            user_id=str(current_user.uid)
        )
        
        if not booking:
            raise HTTPException(
                status_code=500,
                detail="Payment processing failed"
            )
        
        # Get detailed booking information with user and package data
        booking_details = await booking_service.get_booking_details_for_admin(
            session=session,
            booking_id=booking_id
        )
        
        if not booking_details:
            raise HTTPException(
                status_code=500,
                detail="Error retrieving updated booking details"
            )
        
        return BookingResponseModel.model_validate(booking_details)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing payment: {str(e)}"
        )

@booking_router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Cancel a booking"""
    try:
        booking = await booking_service.get_booking_by_id(session, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Verify booking belongs to the user
        if str(booking.user_id) != str(current_user.uid):
            raise HTTPException(
                status_code=403,
                detail="Not authorized to cancel this booking"
            )
        
        # Check if booking can be cancelled
        if booking.status not in ['pending', 'confirmed']:
            raise HTTPException(
                status_code=400,
                detail="Booking cannot be cancelled"
            )
        
        # Update booking status
        status_update = BookingStatusUpdateModel(status='cancelled')
        
        updated_booking = await booking_service.update_booking_status(
            session=session,
            booking_id=booking_id,
            status_data=status_update
        )
        
        if not updated_booking:
            raise HTTPException(
                status_code=500,
                detail="Failed to cancel booking"
            )
        
        return {"message": "Booking cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cancelling booking: {str(e)}"
        )
