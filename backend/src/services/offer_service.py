from typing import Optional, Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from fastapi import HTTPException, UploadFile
from ..models.offer import Offer
from ..schemas.offer_schemas import OfferResponseModel, OfferCreateModel, OfferUpdateModel
from .supabase_service import supabase_service
import uuid
from datetime import datetime


class OfferService:
    async def get_offers(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        discount_type: Optional[str] = None,
        is_active: Optional[bool] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        """Get paginated list of offers with advanced filtering"""
        query = select(Offer)
        
        # Apply filters
        if active_only or is_active is True:
            query = query.where(Offer.is_active == True)
        elif is_active is False:
            query = query.where(Offer.is_active == False)
            
        if search:
            search_term = f"%{search}%"
            query = query.where(
                Offer.title.ilike(search_term) |
                Offer.description.ilike(search_term)
            )
            
        if discount_type:
            query = query.where(Offer.discount_type.ilike(f"%{discount_type}%"))
        
        # Get total count with same filters
        count_query = select(func.count(Offer.id))
        if active_only or is_active is True:
            count_query = count_query.where(Offer.is_active == True)
        elif is_active is False:
            count_query = count_query.where(Offer.is_active == False)
        if search:
            search_term = f"%{search}%"
            count_query = count_query.where(
                Offer.title.ilike(search_term) |
                Offer.description.ilike(search_term)
            )
        if discount_type:
            count_query = count_query.where(Offer.discount_type.ilike(f"%{discount_type}%"))
            
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Offer.title.asc())
        
        result = await session.exec(query)
        offers = result.all()
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "offers": [OfferResponseModel.model_validate(offer) for offer in offers],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    async def get_offer_stats(self, session: AsyncSession) -> Dict[str, Any]:
        """Get offer statistics for admin dashboard"""
        # Total offers
        total_query = select(func.count(Offer.id))
        total_result = await session.exec(total_query)
        total_offers = total_result.one()
        
        # Active offers
        active_query = select(func.count(Offer.id)).where(Offer.is_active == True)
        active_result = await session.exec(active_query)
        active_offers = active_result.one()
        
        # Valid offers (active and within date range)
        current_date = datetime.utcnow().date()
        valid_query = select(func.count(Offer.id)).where(
            Offer.is_active == True,
            Offer.start_date <= current_date,
            Offer.end_date >= current_date
        )
        valid_result = await session.exec(valid_query)
        valid_offers = valid_result.one()
        
        # Offers by discount type
        type_query = select(Offer.discount_type, func.count(Offer.id)).group_by(Offer.discount_type)
        type_result = await session.exec(type_query)
        offers_by_type = {discount_type: count for discount_type, count in type_result.all() if discount_type}
        
        return {
            "total_offers": total_offers,
            "active_offers": active_offers,
            "inactive_offers": total_offers - active_offers,
            "valid_offers": valid_offers,
            "offers_by_type": offers_by_type
        }
    
    async def get_offer_by_id(self, session: AsyncSession, offer_id: str) -> Optional[OfferResponseModel]:
        """Get a specific offer by ID"""
        try:
            offer_uuid = uuid.UUID(offer_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid offer ID format")
            
        query = select(Offer).where(Offer.id == offer_uuid)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            return None
            
        return OfferResponseModel.model_validate(offer)

    async def create_offer(
        self, 
        session: AsyncSession, 
        offer_data: OfferCreateModel,
        banner_image: Optional[UploadFile] = None
    ) -> OfferResponseModel:
        """Create a new offer"""
        try:
            # Handle banner image upload if provided
            banner_image_url = None
            if banner_image:
                banner_image_url = await supabase_service.upload_offer_image(banner_image)
            
            offer = Offer(
                **offer_data.model_dump(exclude_unset=True),
                banner_image=banner_image_url
            )
            
            session.add(offer)
            await session.commit()
            await session.refresh(offer)
            
            return OfferResponseModel.model_validate(offer)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating offer: {str(e)}")

    async def update_offer(
        self, 
        session: AsyncSession, 
        offer_id: str, 
        offer_data: OfferUpdateModel,
        banner_image: Optional[UploadFile] = None
    ) -> Optional[OfferResponseModel]:
        """Update an existing offer"""
        try:
            offer_uuid = uuid.UUID(offer_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid offer ID format")
            
        query = select(Offer).where(Offer.id == offer_uuid)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            return None
        
        try:
            # Handle banner image upload if provided
            if banner_image:
                banner_image_url = await supabase_service.upload_offer_image(banner_image)
                offer.banner_image = banner_image_url
            
            # Update fields
            update_data = offer_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(offer, field, value)
            
            await session.commit()
            await session.refresh(offer)
            
            return OfferResponseModel.model_validate(offer)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error updating offer: {str(e)}")

    async def delete_offer(self, session: AsyncSession, offer_id: str) -> bool:
        """Delete an offer"""
        try:
            offer_uuid = uuid.UUID(offer_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid offer ID format")
            
        query = select(Offer).where(Offer.id == offer_uuid)
        result = await session.exec(query)
        offer = result.first()
        
        if not offer:
            return False
        
        try:
            await session.delete(offer)
            await session.commit()
            return True
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error deleting offer: {str(e)}")


offer_service = OfferService()
