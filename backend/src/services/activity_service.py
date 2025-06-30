from typing import Optional, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from ..models.activity import Activity
from ..schemas.activity_schemas import ActivityResponseModel

class ActivityService:
    async def get_activities(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        statement = select(Activity)
        if active_only:
            statement = statement.where(Activity.is_active == True)
        if search:
            search_term = f"%{search}%"
            statement = statement.where(Activity.name.ilike(search_term))
        count_statement = select(func.count(Activity.id))
        if active_only:
            count_statement = count_statement.where(Activity.is_active == True)
        if search:
            search_term = f"%{search}%"
            count_statement = count_statement.where(Activity.name.ilike(search_term))
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Activity.name.asc())
        result = await session.exec(statement)
        activities = result.all()
        total_pages = (total + limit - 1) // limit
        return {
            "activities": [ActivityResponseModel.model_validate(act) for act in activities],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

activity_service = ActivityService()
