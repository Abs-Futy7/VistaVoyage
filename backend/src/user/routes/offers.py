from fastapi import APIRouter, Depends, HTTPException, Query
from ...db.main import get_session
from ...auth.dependencies import get_current_user
from ...services.offer_service import offer_service
from ...schemas.offer_schemas import OfferListResponseModel

offers_router  = APIRouter()

@offers_router.get("/offers", response_model=OfferListResponseModel)
async def get_offers(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of items per page"),
    search: str = Query(None, description="Search term"),
    session=Depends(get_session),
    current_user=Depends(get_current_user)
):
    try:
        result = await offer_service.get_offers(
            session=session,
            page=page,
            limit=limit,
            search=search,
            active_only=True
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


