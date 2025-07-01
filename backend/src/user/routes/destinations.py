from fastapi import APIRouter, Depends, HTTPException, Query
from ...db.main import get_session
from ...auth.dependencies import get_current_user
from ...services.destination_service import destination_service
from ...schemas.destination_schemas import DestinationListResponseModel, DestinationResponseModel
from sqlmodel.ext.asyncio.session import AsyncSession

destinations_router = APIRouter()

@destinations_router.get("/destinations", response_model=DestinationListResponseModel)
async def get_destinations(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of items per page"),
    search: str = Query(None, description="Search term"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Get public destinations with pagination and optional search.
    
    This endpoint returns a paginated list of destinations.
    """
    try:
        result = await destination_service.get_destinations(
            session=session,
            page=page,
            limit=limit,
            search=search
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@destinations_router.get("/destinations/{destination_id}", response_model=DestinationResponseModel)
async def get_destination_by_id(
    destination_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """
    Get a single destination by its ID.
    """
    try:
        destination = await destination_service.get_destination_by_id(session, destination_id)
        if not destination:
            raise HTTPException(status_code=404, detail="Destination not found")
        return destination
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

