"""
Admin offers routes
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Form, File, UploadFile
from typing import Optional, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
import uuid
from datetime import datetime

from ...db.main import get_session
from ...models.offer import Offer
from ...schemas.offer_schemas import (
    OfferCreateModel, 
    OfferUpdateModel, 
    OfferResponseModel,
    OfferListResponseModel
)
from ..dependencies import admin_access_bearer

offers_router = APIRouter()


@offers_router.get("/offers", response_model=OfferListResponseModel)
async def get_offers(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term for offer title or description"),
    offer_type: Optional[str] = Query(None, description="Filter by offer type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get all offers with pagination and filtering"""
    try:
        # Build base query
        query = select(Offer)
        count_query = select(func.count(Offer.id))
        
        # Apply filters
        if search:
            search_filter = (
                Offer.title.ilike(f"%{search}%") |
                Offer.description.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        if offer_type:
            # Since we removed offer_type field, we'll ignore this filter
            # or you can remove this parameter entirely from the endpoint
            pass
            
        if is_active is not None:
            active_filter = Offer.is_active == is_active
            query = query.where(active_filter)
            count_query = count_query.where(active_filter)
        
        # Get total count
        total_result = await session.exec(count_query)
        total = total_result.one()
        
        # Add pagination and ordering
        offset = (page - 1) * limit
        query = query.order_by(Offer.created_at.desc()).offset(offset).limit(limit)
        
        # Execute query
        result = await session.exec(query)
        offers = result.all()
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        return OfferListResponseModel(
            offers=offers,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offers: {str(e)}")


@offers_router.get("/offers/stats")
async def get_offers_stats(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get offer statistics"""
    try:
        # Total offers
        total_query = select(func.count(Offer.id))
        total_result = await session.exec(total_query)
        total_offers = total_result.one()
        
        # Active offers
        active_query = select(func.count(Offer.id)).where(Offer.is_active == True)
        active_result = await session.exec(active_query)
        active_offers = active_result.one()
        
        # Offers by type - since we removed offer_type, we'll return empty dict
        offers_by_type = {}
        
        # Active offers by date range
        now = datetime.utcnow()
        current_active_query = select(func.count(Offer.id)).where(
            Offer.is_active == True,
            Offer.valid_from <= now,
            Offer.valid_until >= now
        )
        current_active_result = await session.exec(current_active_query)
        current_active_offers = current_active_result.one()
        
        return {
            "total_offers": total_offers,
            "active_offers": active_offers,
            "inactive_offers": total_offers - active_offers,
            "current_active_offers": current_active_offers,
            "offers_by_type": offers_by_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offer stats: {str(e)}")


@offers_router.get("/offers/{offer_id}", response_model=OfferResponseModel)
async def get_offer(
    offer_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get a specific offer by ID"""
    try:
        query = select(Offer).where(Offer.id == offer_id)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
            
        return offer
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offer: {str(e)}")


@offers_router.post("/offers", response_model=OfferResponseModel)
async def create_offer(
    title: str = Form(...),
    description: str = Form(...),
    valid_from: str = Form(...),
    valid_until: str = Form(...),
    is_active: bool = Form(True),
    discount_percentage: Optional[float] = Form(None),
    discount_amount: Optional[float] = Form(None),
    max_usage_per_user: Optional[int] = Form(None),
    total_usage_limit: Optional[int] = Form(None),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Create a new offer"""
    try:
        # Parse datetime strings
        try:
            # Try multiple datetime formats
            def parse_datetime(dt_str: str) -> datetime:
                formats = [
                    "%Y-%m-%dT%H:%M:%S.%fZ",     # ISO with microseconds and Z
                    "%Y-%m-%dT%H:%M:%SZ",        # ISO with Z
                    "%Y-%m-%dT%H:%M:%S",         # ISO basic
                    "%Y-%m-%d %H:%M:%S",         # Space separated
                    "%Y-%m-%dT%H:%M",            # ISO without seconds
                ]
                
                for fmt in formats:
                    try:
                        return datetime.strptime(dt_str, fmt)
                    except ValueError:
                        continue
                
                # If all formats fail, try fromisoformat
                return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            
            valid_from_dt = parse_datetime(valid_from)
            valid_until_dt = parse_datetime(valid_until)
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid datetime format: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing datetime: {str(e)}")
        
        # Validate dates
        if valid_from_dt >= valid_until_dt:
            raise HTTPException(status_code=400, detail="Valid from date must be before valid until date")
        
        # Create offer data
        offer_data = {
            "title": title,
            "description": description,
            "valid_from": valid_from_dt,
            "valid_until": valid_until_dt,
            "is_active": is_active,
            "discount_percentage": discount_percentage,
            "discount_amount": discount_amount,
            "max_usage_per_user": max_usage_per_user,
            "total_usage_limit": total_usage_limit
        }
        
        # Create new offer
        offer = Offer(**offer_data)
        
        session.add(offer)
        await session.commit()
        await session.refresh(offer)
        
        return offer
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating offer: {str(e)}")


@offers_router.put("/offers/{offer_id}", response_model=OfferResponseModel)
async def update_offer(
    offer_id: uuid.UUID,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    valid_from: Optional[str] = Form(None),
    valid_until: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    discount_percentage: Optional[float] = Form(None),
    discount_amount: Optional[float] = Form(None),
    max_usage_per_user: Optional[int] = Form(None),
    total_usage_limit: Optional[int] = Form(None),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Update an existing offer"""
    try:
        # Get existing offer
        query = select(Offer).where(Offer.id == offer_id)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Prepare update data
        update_data = {}
        
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if is_active is not None:
            update_data["is_active"] = is_active
        if discount_percentage is not None:
            update_data["discount_percentage"] = discount_percentage
        if discount_amount is not None:
            update_data["discount_amount"] = discount_amount
        if max_usage_per_user is not None:
            update_data["max_usage_per_user"] = max_usage_per_user
        if total_usage_limit is not None:
            update_data["total_usage_limit"] = total_usage_limit
            
        # Handle datetime fields
        def parse_datetime(dt_str: str) -> datetime:
            formats = [
                "%Y-%m-%dT%H:%M:%S.%fZ",     # ISO with microseconds and Z
                "%Y-%m-%dT%H:%M:%SZ",        # ISO with Z
                "%Y-%m-%dT%H:%M:%S",         # ISO basic
                "%Y-%m-%d %H:%M:%S",         # Space separated
                "%Y-%m-%dT%H:%M",            # ISO without seconds
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(dt_str, fmt)
                except ValueError:
                    continue
            
            # If all formats fail, try fromisoformat
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            
        if valid_from is not None:
            try:
                update_data["valid_from"] = parse_datetime(valid_from)
            except (ValueError, Exception) as e:
                raise HTTPException(status_code=400, detail=f"Invalid valid_from datetime format: {str(e)}")
                
        if valid_until is not None:
            try:
                update_data["valid_until"] = parse_datetime(valid_until)
            except (ValueError, Exception) as e:
                raise HTTPException(status_code=400, detail=f"Invalid valid_until datetime format: {str(e)}")
        
        # Validate dates if both are provided or one is being updated
        final_valid_from = update_data.get('valid_from', offer.valid_from)
        final_valid_until = update_data.get('valid_until', offer.valid_until)
        if final_valid_from and final_valid_until and final_valid_from >= final_valid_until:
            raise HTTPException(status_code=400, detail="Valid from date must be before valid until date")
        
        # Update offer fields
        for field, value in update_data.items():
            setattr(offer, field, value)
        
        # Update the updated_at timestamp
        offer.updated_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(offer)
        
        return offer
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating offer: {str(e)}")


@offers_router.delete("/offers/{offer_id}")
async def delete_offer(
    offer_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Delete an offer"""
    try:
        # Get existing offer
        query = select(Offer).where(Offer.id == offer_id)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        await session.delete(offer)
        await session.commit()
        
        return {"message": "Offer deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting offer: {str(e)}")


@offers_router.patch("/offers/{offer_id}/toggle-active")
async def toggle_offer_status(
    offer_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Toggle offer active status"""
    try:
        # Get existing offer
        query = select(Offer).where(Offer.id == offer_id)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Toggle status
        offer.is_active = not offer.is_active
        offer.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(offer)
        
        return {
            "message": f"Offer {'activated' if offer.is_active else 'deactivated'} successfully",
            "is_active": offer.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error toggling offer status: {str(e)}")


@offers_router.get("/offers/types/list")
async def get_offer_types(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get list of all offer types - deprecated since offer_type field was removed"""
    try:
        # Since we removed offer_type field, return empty list
        return {"offer_types": []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offer types: {str(e)}")


@offers_router.get("/offers/active/current")
async def get_current_active_offers(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get currently active offers (within date range)"""
    try:
        now = datetime.utcnow()
        query = select(Offer).where(
            Offer.is_active == True,
            Offer.valid_from <= now,
            Offer.valid_until >= now
        ).order_by(Offer.created_at.desc())
        result = await session.exec(query)
        offers = result.all()
        
        return offers
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching current active offers: {str(e)}")


@offers_router.get("/offers/expiring/soon")
async def get_expiring_offers(
    days: int = Query(7, ge=1, le=30, description="Number of days to check for expiring offers"),
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get offers expiring within specified days"""
    try:
        from datetime import timedelta
        
        now = datetime.utcnow()
        expiry_date = now + timedelta(days=days)
        
        query = select(Offer).where(
            Offer.is_active == True,
            Offer.valid_until >= now,
            Offer.valid_until <= expiry_date
        ).order_by(Offer.valid_until.asc())
        result = await session.exec(query)
        offers = result.all()
        
        return offers
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expiring offers: {str(e)}")