from typing import Optional, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from ..models.destination import Destination
from ..schemas.destination_schemas import DestinationResponseModel

class DestinationService:
    async def get_destinations(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        statement = select(Destination)
        if active_only:
            statement = statement.where(Destination.is_active == True)
        if search:
            search_term = f"%{search}%"
            statement = statement.where(Destination.name.ilike(search_term))
        count_statement = select(func.count(Destination.id))
        if active_only:
            count_statement = count_statement.where(Destination.is_active == True)
        if search:
            search_term = f"%{search}%"
            count_statement = count_statement.where(Destination.name.ilike(search_term))
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Destination.name.asc())
        result = await session.exec(statement)
        destinations = result.all()
        total_pages = (total + limit - 1) // limit
        return {
            "destinations": [DestinationResponseModel.model_validate(dest) for dest in destinations],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    async def get_destination_by_id(self, session: AsyncSession, destination_id: str):
        statement = select(Destination).where(Destination.id == destination_id)
        result = await session.exec(statement)
        destination = result.first()
        if not destination:
            return None
        return DestinationResponseModel.model_validate(destination)

destination_service = DestinationService()
