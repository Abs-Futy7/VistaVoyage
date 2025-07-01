from fastapi import APIRouter, Depends, HTTPException, Query
from ...db.main import get_session
from ...auth.dependencies import get_current_user
from ...services.trip_type_service import trip_type_service
from ...schemas.trip_type_schemas import TripTypeListResponseModel, TripTypeResponseModel
from sqlmodel.ext.asyncio.session import AsyncSession

trip_type_router = APIRouter()

@trip_type_router.get("/trip-types", response_model=TripTypeListResponseModel)
async def get_trip_types(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of items per page"),
    search: str = Query(None, description="Search term"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    try:
        result = await trip_type_service.get_trip_types(
            session=session,
            page=page,
            limit=limit,
            search=search
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@trip_type_router.get("/trip-types/{trip_type_id}", response_model=TripTypeResponseModel)
async def get_trip_type_by_id(
    trip_type_id: str,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    try:
        trip_type = await trip_type_service.get_trip_type_by_id(session, trip_type_id)
        if not trip_type:
            raise HTTPException(status_code=404, detail="Trip type not found")
        return trip_type
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
