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
    BookingListResponseModel
)
from ...services.booking_service import booking_service
from ...auth.dependencies import get_current_user

booking_router = APIRouter()

@booking_router.post("/", response_model=BookingResponseModel)
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
        
        return BookingResponseModel.model_validate(booking)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating booking: {str(e)}"
        )


@booking_router.get("/", response_model=BookingListResponseModel)
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


@booking_router.get("/{booking_id}", response_model=BookingResponseModel)
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


@booking_router.post("/validate-promo")
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
