"""
Admin bookings routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...services.booking_service import booking_service
from ...schemas.booking_schemas import BookingStatusUpdateModel
from ..dependencies import admin_access_bearer

bookings_router = APIRouter()


@bookings_router.get("/bookings")
async def get_bookings(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None, 
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """Get paginated list of bookings with filtering"""
    try:
        result = await booking_service.get_bookings(
            session=session,
            page=page,
            limit=limit,
            search=search,
            status=status,
            user_id=None  # Admin can see all bookings
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@bookings_router.get("/bookings/{booking_id}")
async def get_booking(
    booking_id: str, 
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get details of a specific booking"""
    try:
        booking_details = await booking_service.get_booking_details_for_admin(
            session=session,
            booking_id=booking_id
        )
        if not booking_details:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking_details
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@bookings_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str, 
    status_data: BookingStatusUpdateModel,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update the status of a booking"""
    try:
        booking = await booking_service.update_booking_status(
            session=session,
            booking_id=booking_id,
            status_data=status_data
        )
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
