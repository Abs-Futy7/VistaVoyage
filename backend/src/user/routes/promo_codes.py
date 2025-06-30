"""
User promo code routes for validation
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...schemas.promo_code_schemas import PromoCodeValidationModel, PromoCodeValidationResponseModel
from ...services.promo_code_service import PromoCodeService
from ...auth.dependencies import get_current_user

promo_codes_router = APIRouter()


@promo_codes_router.post("/validate", response_model=PromoCodeValidationResponseModel)
async def validate_promo_code(
    validation_data: PromoCodeValidationModel,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Validate a promo code for a booking.
    
    Users can provide either a promo code string or a promo code ID.
    Returns validation result with discount information.
    """
    try:
        # Convert async session to sync session for promo code service
        sync_session = session.sync_session
        
        validation_result = PromoCodeService.validate_promo_code(
            session=sync_session,
            code=validation_data.code,
            promo_code_id=validation_data.promo_code_id,
            booking_amount=validation_data.booking_amount,
            package_id=validation_data.package_id
        )
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating promo code: {str(e)}"
        )


@promo_codes_router.get("/check/{code}", response_model=PromoCodeValidationResponseModel)
async def check_promo_code_quick(
    code: str,
    booking_amount: float = Query(gt=0, description="Booking amount to calculate discount"),
    package_id: Optional[str] = Query(None, description="Package ID for validation"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Quick check for a promo code by code string.
    
    This is a convenience endpoint for frontend to quickly validate
    a promo code without sending a full validation request.
    """
    try:
        # Convert async session to sync session for promo code service
        sync_session = session.sync_session
        
        # Convert package_id to UUID if provided
        package_uuid = None
        if package_id:
            try:
                import uuid
                package_uuid = uuid.UUID(package_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid package ID format"
                )
        
        validation_result = PromoCodeService.validate_promo_code(
            session=sync_session,
            code=code,
            booking_amount=booking_amount,
            package_id=package_uuid
        )
        
        return validation_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking promo code: {str(e)}"
        )
