from typing import Optional, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from ..models.trip_type import TripType
from ..schemas.trip_type_schemas import TripTypeListResponseModel, TripTypeResponseModel

class TripTypeService:
    async def get_trip_types(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        statement = select(TripType)
        if search:
            search_term = f"%{search}%"
            statement = statement.where(TripType.name.ilike(search_term))
        count_statement = select(func.count(TripType.id))
        if search:
            search_term = f"%{search}%"
            count_statement = count_statement.where(TripType.name.ilike(search_term))
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(TripType.name.asc())
        result = await session.exec(statement)
        trip_types = result.all()
        total_pages = (total + limit - 1) // limit
        return {
            "trip_types": [TripTypeResponseModel.model_validate(tt) for tt in trip_types],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    async def get_trip_type_by_id(self, session: AsyncSession, trip_type_id: str):
        statement = select(TripType).where(TripType.id == trip_type_id)
        result = await session.exec(statement)
        trip_type = result.first()
        if not trip_type:
            return None
        return TripTypeResponseModel.model_validate(trip_type)

trip_type_service = TripTypeService()
