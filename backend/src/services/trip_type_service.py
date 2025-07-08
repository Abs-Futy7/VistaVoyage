from typing import Optional, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from fastapi import HTTPException
from ..models.trip_type import TripType
from ..schemas.trip_type_schemas import TripTypeListResponseModel, TripTypeResponseModel, TripTypeCreateModel, TripTypeUpdateModel
import uuid


class TripTypeService:
    async def get_trip_types(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Get paginated list of trip types with filtering"""
        query = select(TripType)
        
        # Apply filters
        if is_active is not None:
            query = query.where(TripType.is_active == is_active)
            
        if search:
            search_term = f"%{search}%"
            query = query.where(
                TripType.name.ilike(search_term) |
                TripType.description.ilike(search_term)
            )
        
        # Get total count with same filters
        count_query = select(func.count(TripType.id))
        if is_active is not None:
            count_query = count_query.where(TripType.is_active == is_active)
        if search:
            search_term = f"%{search}%"
            count_query = count_query.where(
                TripType.name.ilike(search_term) |
                TripType.description.ilike(search_term)
            )
            
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(TripType.name.asc())
        
        result = await session.exec(query)
        trip_types = result.all()
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "trip_types": [TripTypeResponseModel.model_validate(tt) for tt in trip_types],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    async def get_trip_type_stats(self, session: AsyncSession) -> Dict[str, Any]:
        """Get trip type statistics for admin dashboard"""
        # Total trip types
        total_query = select(func.count(TripType.id))
        total_result = await session.exec(total_query)
        total_trip_types = total_result.one()
        
        # Active trip types
        active_query = select(func.count(TripType.id)).where(TripType.is_active == True)
        active_result = await session.exec(active_query)
        active_trip_types = active_result.one()
        
        return {
            "total_trip_types": total_trip_types,
            "active_trip_types": active_trip_types,
            "inactive_trip_types": total_trip_types - active_trip_types
        }

    async def get_trip_type_by_id(self, session: AsyncSession, trip_type_id: str) -> Optional[TripTypeResponseModel]:
        """Get a specific trip type by ID"""
        try:
            trip_type_uuid = uuid.UUID(trip_type_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid trip type ID format")
            
        query = select(TripType).where(TripType.id == trip_type_uuid)
        result = await session.exec(query)
        trip_type = result.first()
        
        if not trip_type:
            return None
            
        return TripTypeResponseModel.model_validate(trip_type)

    async def create_trip_type(
        self, 
        session: AsyncSession, 
        trip_type_data: TripTypeCreateModel
    ) -> TripTypeResponseModel:
        """Create a new trip type"""
        try:
            trip_type = TripType(**trip_type_data.model_dump(exclude_unset=True))
            
            session.add(trip_type)
            await session.commit()
            await session.refresh(trip_type)
            
            return TripTypeResponseModel.model_validate(trip_type)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating trip type: {str(e)}")

    async def update_trip_type(
        self, 
        session: AsyncSession, 
        trip_type_id: str, 
        trip_type_data: TripTypeUpdateModel
    ) -> Optional[TripTypeResponseModel]:
        """Update an existing trip type"""
        try:
            trip_type_uuid = uuid.UUID(trip_type_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid trip type ID format")
            
        query = select(TripType).where(TripType.id == trip_type_uuid)
        result = await session.exec(query)
        trip_type = result.first()
        
        if not trip_type:
            return None
        
        try:
            # Update fields
            update_data = trip_type_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(trip_type, field, value)
            
            await session.commit()
            await session.refresh(trip_type)
            
            return TripTypeResponseModel.model_validate(trip_type)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error updating trip type: {str(e)}")

    async def delete_trip_type(self, session: AsyncSession, trip_type_id: str) -> bool:
        """Delete a trip type"""
        try:
            trip_type_uuid = uuid.UUID(trip_type_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid trip type ID format")
            
        query = select(TripType).where(TripType.id == trip_type_uuid)
        result = await session.exec(query)
        trip_type = result.first()
        
        if not trip_type:
            return False
        
        try:
            await session.delete(trip_type)
            await session.commit()
            return True
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error deleting trip type: {str(e)}")


trip_type_service = TripTypeService()
