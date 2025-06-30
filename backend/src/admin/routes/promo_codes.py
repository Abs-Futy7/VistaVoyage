"""
Admin promo codes routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
import uuid
from datetime import datetime, date

from ...db.main import get_session
from ...models.promo_code import PromoCode
from ...schemas.promo_code_schemas import (
    PromoCodeCreateModel, 
    PromoCodeUpdateModel, 
    PromoCodeResponseModel,
    PromoCodeListResponseModel
)
from ..dependencies import admin_access_bearer

promo_codes_router = APIRouter()


def validate_uuid(uuid_string: str) -> uuid.UUID:
    """Validate and convert string to UUID"""
    try:
        return uuid.UUID(uuid_string)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


@promo_codes_router.get("/promo-codes", response_model=PromoCodeListResponseModel)
async def get_promo_codes(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term for promo code"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    discount_type: Optional[str] = Query(None, description="Filter by discount type"),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get all promo codes with pagination and filtering"""
    try:
        # Build query
        query = select(PromoCode)
        
        # Apply filters
        if search:
            query = query.where(
                PromoCode.code.ilike(f"%{search}%") |
                PromoCode.description.ilike(f"%{search}%")
            )
        
        if is_active is not None:
            query = query.where(PromoCode.is_active == is_active)
            
        if discount_type:
            query = query.where(PromoCode.discount_type.ilike(f"%{discount_type}%"))
        
        # Get total count
        count_query = select(func.count(PromoCode.id))
        if search:
            count_query = count_query.where(
                PromoCode.code.ilike(f"%{search}%") |
                PromoCode.description.ilike(f"%{search}%")
            )
        if is_active is not None:
            count_query = count_query.where(PromoCode.is_active == is_active)
        if discount_type:
            count_query = count_query.where(PromoCode.discount_type.ilike(f"%{discount_type}%"))
        
        count_result = await session.exec(count_query)
        total = count_result.one()
        
        # Add pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        query = query.order_by(PromoCode.created_at.desc())
        
        # Execute query
        result = await session.exec(query)
        promo_codes = result.all()
        
        # Calculate computed fields for each promo code
        promo_codes_data = []
        current_date = datetime.utcnow().date()
        
        for pc in promo_codes:
            # Calculate remaining uses
            usage_count = pc.used_count or pc.current_usage or 0
            limit_count = pc.usage_limit or pc.max_usage
            remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
            
            # Check if valid
            is_valid = (
                pc.is_active and
                current_date >= pc.start_date and
                current_date <= pc.expiry_date and
                (limit_count is None or usage_count < limit_count)
            )
            
            # Create response data
            pc_data = {
                "id": pc.id,
                "code": pc.code,
                "description": pc.description,
                "discount_type": pc.discount_type,
                "discount_value": pc.discount_value,
                "minimum_amount": pc.minimum_amount,
                "maximum_discount": pc.maximum_discount,
                "start_date": pc.start_date,
                "expiry_date": pc.expiry_date,
                "usage_limit": pc.usage_limit,
                "used_count": pc.used_count,
                "is_active": pc.is_active,
                "created_at": pc.created_at,
                "updated_at": pc.updated_at,
                "offer_id": pc.offer_id,
                "max_usage": pc.max_usage,
                "current_usage": pc.current_usage,
                "remaining_uses": remaining_uses,
                "is_valid": is_valid,
                "is_expired": current_date > pc.expiry_date
            }
            
            promo_codes_data.append(PromoCodeResponseModel(**pc_data))
        
        total_pages = (total + limit - 1) // limit
        
        return PromoCodeListResponseModel(
            promo_codes=promo_codes_data,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promo codes: {str(e)}")


@promo_codes_router.get("/promo-codes/stats")
async def get_promo_codes_stats(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get promo code statistics"""
    try:
        # Total promo codes
        total_query = select(func.count(PromoCode.id))
        total_result = await session.exec(total_query)
        total_codes = total_result.one()
        
        # Active promo codes
        active_query = select(func.count(PromoCode.id)).where(PromoCode.is_active == True)
        active_result = await session.exec(active_query)
        active_codes = active_result.one()
        
        # Expired promo codes
        current_date = datetime.utcnow().date()
        expired_query = select(func.count(PromoCode.id)).where(PromoCode.expiry_date < current_date)
        expired_result = await session.exec(expired_query)
        expired_codes = expired_result.one()
        
        # Codes by discount type
        type_query = select(PromoCode.discount_type, func.count(PromoCode.id)).group_by(PromoCode.discount_type)
        type_result = await session.exec(type_query)
        codes_by_type = {discount_type: count for discount_type, count in type_result.all()}
        
        return {
            "total_codes": total_codes,
            "active_codes": active_codes,
            "inactive_codes": total_codes - active_codes,
            "expired_codes": expired_codes,
            "codes_by_type": codes_by_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promo code stats: {str(e)}")


@promo_codes_router.get("/promo-codes/{promo_code_id}", response_model=PromoCodeResponseModel)
async def get_promo_code(
    promo_code_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get a specific promo code by ID"""
    try:
        query = select(PromoCode).where(PromoCode.id == promo_code_id)
        result = await session.exec(query)
        promo_code = result.first()
        
        if not promo_code:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        # Calculate computed fields
        current_date = datetime.utcnow().date()
        usage_count = promo_code.used_count or promo_code.current_usage or 0
        limit_count = promo_code.usage_limit or promo_code.max_usage
        remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
        
        is_valid = (
            promo_code.is_active and
            current_date >= promo_code.start_date and
            current_date <= promo_code.expiry_date and
            (limit_count is None or usage_count < limit_count)
        )
        
        pc_data = {
            "id": promo_code.id,
            "code": promo_code.code,
            "description": promo_code.description,
            "discount_type": promo_code.discount_type,
            "discount_value": promo_code.discount_value,
            "minimum_amount": promo_code.minimum_amount,
            "maximum_discount": promo_code.maximum_discount,
            "start_date": promo_code.start_date,
            "expiry_date": promo_code.expiry_date,
            "usage_limit": promo_code.usage_limit,
            "used_count": promo_code.used_count,
            "is_active": promo_code.is_active,
            "created_at": promo_code.created_at,
            "updated_at": promo_code.updated_at,
            "offer_id": promo_code.offer_id,
            "max_usage": promo_code.max_usage,
            "current_usage": promo_code.current_usage,
            "remaining_uses": remaining_uses,
            "is_valid": is_valid,
            "is_expired": current_date > promo_code.expiry_date
        }
        
        return PromoCodeResponseModel(**pc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promo code: {str(e)}")


@promo_codes_router.post("/promo-codes", response_model=PromoCodeResponseModel)
async def create_promo_code(
    promo_code_data: PromoCodeCreateModel,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Create a new promo code"""
    try:
        # Check if code already exists
        existing_query = select(PromoCode).where(PromoCode.code == promo_code_data.code.upper())
        existing_result = await session.exec(existing_query)
        if existing_result.first():
            raise HTTPException(status_code=400, detail="Promo code already exists")
        
        # Create new promo code
        promo_code_dict = promo_code_data.model_dump()
        # Set legacy fields for backward compatibility
        promo_code_dict['max_usage'] = promo_code_dict.get('usage_limit')
        promo_code_dict['current_usage'] = 0
        promo_code_dict['used_count'] = 0
        
        promo_code = PromoCode(**promo_code_dict)
        
        session.add(promo_code)
        await session.commit()
        await session.refresh(promo_code)
        
        # Calculate computed fields
        current_date = datetime.utcnow().date()
        usage_count = promo_code.used_count or promo_code.current_usage or 0
        limit_count = promo_code.usage_limit or promo_code.max_usage
        remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
        
        is_valid = (
            promo_code.is_active and
            current_date >= promo_code.start_date and
            current_date <= promo_code.expiry_date and
            (limit_count is None or usage_count < limit_count)
        )
        
        pc_data = {
            "id": promo_code.id,
            "code": promo_code.code,
            "description": promo_code.description,
            "discount_type": promo_code.discount_type,
            "discount_value": promo_code.discount_value,
            "minimum_amount": promo_code.minimum_amount,
            "maximum_discount": promo_code.maximum_discount,
            "start_date": promo_code.start_date,
            "expiry_date": promo_code.expiry_date,
            "usage_limit": promo_code.usage_limit,
            "used_count": promo_code.used_count,
            "is_active": promo_code.is_active,
            "created_at": promo_code.created_at,
            "updated_at": promo_code.updated_at,
            "offer_id": promo_code.offer_id,
            "max_usage": promo_code.max_usage,
            "current_usage": promo_code.current_usage,
            "remaining_uses": remaining_uses,
            "is_valid": is_valid,
            "is_expired": current_date > promo_code.expiry_date
        }
        
        return PromoCodeResponseModel(**pc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating promo code: {str(e)}")


@promo_codes_router.put("/promo-codes/{promo_code_id}", response_model=PromoCodeResponseModel)
async def update_promo_code(
    promo_code_id: uuid.UUID,
    promo_code_data: PromoCodeUpdateModel,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Update an existing promo code"""
    try:
        # Get existing promo code
        query = select(PromoCode).where(PromoCode.id == promo_code_id)
        result = await session.exec(query)
        promo_code = result.first()
        
        if not promo_code:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        # Update promo code fields
        update_data = promo_code_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(promo_code, field, value)
            
        # Keep legacy fields in sync
        if 'usage_limit' in update_data:
            promo_code.max_usage = update_data['usage_limit']
        
        await session.commit()
        await session.refresh(promo_code)
        
        # Calculate computed fields
        current_date = datetime.utcnow().date()
        usage_count = promo_code.used_count or promo_code.current_usage or 0
        limit_count = promo_code.usage_limit or promo_code.max_usage
        remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
        
        is_valid = (
            promo_code.is_active and
            current_date >= promo_code.start_date and
            current_date <= promo_code.expiry_date and
            (limit_count is None or usage_count < limit_count)
        )
        
        pc_data = {
            "id": promo_code.id,
            "code": promo_code.code,
            "description": promo_code.description,
            "discount_type": promo_code.discount_type,
            "discount_value": promo_code.discount_value,
            "minimum_amount": promo_code.minimum_amount,
            "maximum_discount": promo_code.maximum_discount,
            "start_date": promo_code.start_date,
            "expiry_date": promo_code.expiry_date,
            "usage_limit": promo_code.usage_limit,
            "used_count": promo_code.used_count,
            "is_active": promo_code.is_active,
            "created_at": promo_code.created_at,
            "updated_at": promo_code.updated_at,
            "offer_id": promo_code.offer_id,
            "max_usage": promo_code.max_usage,
            "current_usage": promo_code.current_usage,
            "remaining_uses": remaining_uses,
            "is_valid": is_valid,
            "is_expired": current_date > promo_code.expiry_date
        }
        
        return PromoCodeResponseModel(**pc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating promo code: {str(e)}")


@promo_codes_router.delete("/promo-codes/{promo_code_id}")
async def delete_promo_code(
    promo_code_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Delete a promo code"""
    try:
        # Get existing promo code
        query = select(PromoCode).where(PromoCode.id == promo_code_id)
        result = await session.exec(query)
        promo_code = result.first()
        
        if not promo_code:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        await session.delete(promo_code)
        await session.commit()
        
        return {"message": "Promo code deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting promo code: {str(e)}")


@promo_codes_router.patch("/promo-codes/{promo_code_id}/toggle-status")
async def toggle_promo_code_status(
    promo_code_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Toggle promo code active status"""
    try:
        # Get existing promo code
        query = select(PromoCode).where(PromoCode.id == promo_code_id)
        result = await session.exec(query)
        promo_code = result.first()
        
        if not promo_code:
            raise HTTPException(status_code=404, detail="Promo code not found")
        
        # Toggle status
        promo_code.is_active = not promo_code.is_active
        await session.commit()
        await session.refresh(promo_code)
        
        # Calculate computed fields
        current_date = datetime.utcnow().date()
        usage_count = promo_code.used_count or promo_code.current_usage or 0
        limit_count = promo_code.usage_limit or promo_code.max_usage
        remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
        
        is_valid = (
            promo_code.is_active and
            current_date >= promo_code.start_date and
            current_date <= promo_code.expiry_date and
            (limit_count is None or usage_count < limit_count)
        )
        
        pc_data = {
            "id": promo_code.id,
            "code": promo_code.code,
            "description": promo_code.description,
            "discount_type": promo_code.discount_type,
            "discount_value": promo_code.discount_value,
            "minimum_amount": promo_code.minimum_amount,
            "maximum_discount": promo_code.maximum_discount,
            "start_date": promo_code.start_date,
            "expiry_date": promo_code.expiry_date,
            "usage_limit": promo_code.usage_limit,
            "used_count": promo_code.used_count,
            "is_active": promo_code.is_active,
            "created_at": promo_code.created_at,
            "updated_at": promo_code.updated_at,
            "offer_id": promo_code.offer_id,
            "max_usage": promo_code.max_usage,
            "current_usage": promo_code.current_usage,
            "remaining_uses": remaining_uses,
            "is_valid": is_valid,
            "is_expired": current_date > promo_code.expiry_date
        }
        
        return {
            "message": f"Promo code {'activated' if promo_code.is_active else 'deactivated'} successfully",
            "promo_code": PromoCodeResponseModel(**pc_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error toggling promo code status: {str(e)}")


@promo_codes_router.get("/promo-codes/validate/{code}")
async def validate_promo_code(
    code: str,
    booking_amount: Optional[float] = Query(None, description="Booking amount to validate against"),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Validate a promo code"""
    try:
        query = select(PromoCode).where(PromoCode.code == code.upper())
        result = await session.exec(query)
        promo_code = result.first()
        
        if not promo_code:
            return {"valid": False, "message": "Promo code not found"}
        
        if not promo_code.is_active:
            return {"valid": False, "message": "Promo code is inactive"}
        
        current_date = datetime.utcnow().date()
        
        if current_date < promo_code.start_date:
            return {"valid": False, "message": "Promo code is not yet active"}
        
        if current_date > promo_code.expiry_date:
            return {"valid": False, "message": "Promo code has expired"}
        
        if promo_code.usage_limit and promo_code.used_count >= promo_code.usage_limit:
            return {"valid": False, "message": "Promo code usage limit reached"}
        
        # Check minimum amount if provided
        if booking_amount and promo_code.minimum_amount and booking_amount < promo_code.minimum_amount:
            return {
                "valid": False, 
                "message": f"Minimum booking amount of ${promo_code.minimum_amount} required"
            }
        
        # Calculate remaining uses
        usage_count = promo_code.used_count or promo_code.current_usage or 0
        limit_count = promo_code.usage_limit or promo_code.max_usage
        remaining_uses = None if limit_count is None else max(0, limit_count - usage_count)
        
        validation_result = {
            "valid": True,
            "message": "Promo code is valid",
            "promo_code_id": promo_code.id,
            "discount_type": promo_code.discount_type,
            "discount_value": promo_code.discount_value,
            "remaining_uses": remaining_uses
        }
        
        # Calculate discount if booking amount provided
        if booking_amount:
            # Calculate discount based on type
            if promo_code.discount_type == "percentage":
                discount_amount = booking_amount * (promo_code.discount_value / 100)
            elif promo_code.discount_type == "fixed":
                discount_amount = promo_code.discount_value
            else:
                discount_amount = 0.0
                
            # Apply maximum discount limit
            if promo_code.maximum_discount:
                discount_amount = min(discount_amount, promo_code.maximum_discount)
                
            # Ensure discount doesn't exceed the amount
            discount_amount = min(discount_amount, booking_amount)
            final_amount = booking_amount - discount_amount
            
            validation_result.update({
                "discount_amount": discount_amount,
                "final_amount": final_amount,
                "original_amount": booking_amount
            })
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating promo code: {str(e)}")
