from typing import Optional, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from ..models.offer import Offer
from ..schemas.offer_schemas import OfferResponseModel

class OfferService:
    async def get_offers(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        statement = select(Offer)
        if active_only:
            statement = statement.where(Offer.is_active == True)
        if search:
            search_term = f"%{search}%"
            statement = statement.where(Offer.title.ilike(search_term))
        count_statement = select(func.count(Offer.id))
        if active_only:
            count_statement = count_statement.where(Offer.is_active == True)
        if search:
            search_term = f"%{search}%"
            count_statement = count_statement.where(Offer.title.ilike(search_term))
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Offer.title.asc())
        result = await session.exec(statement)
        offers = result.all()
        total_pages = (total + limit - 1) // limit
        return {
            "offers": [OfferResponseModel.model_validate(offer) for offer in offers],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    async def get_offer_by_id(self, session, offer_id: str):
        from ..models.offer import Offer
        from ..schemas.offer_schemas import OfferResponseModel
        from sqlmodel import select
        statement = select(Offer).where(Offer.id == offer_id)
        result = await session.exec(statement)
        offer = result.first()
        if not offer:
            return None
        return OfferResponseModel.model_validate(offer)

offer_service = OfferService()
