"""
Admin trip types routes
"""
from fastapi import APIRouter, HTTPException, Depends, Form
from typing import Optional
from datetime import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from ...db.main import get_session
from ...models.trip_type import TripType
from ..dependencies import admin_access_bearer
from .utils import validate_uuid

trip_types_router = APIRouter()


@trip_types_router.get("/trip-types")
async def get_trip_types(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """Get paginated list of trip types with filtering"""
    try:
        query = select(TripType)
        
        if search:
            query = query.where(
                TripType.name.ilike(f"%{search}%") |
                TripType.category.ilike(f"%{search}%")
            )
        
        # Get total count
        count_query = select(func.count(TripType.id))
        if search:
            count_query = count_query.where(
                TripType.name.ilike(f"%{search}%") |
                TripType.category.ilike(f"%{search}%")
            )
        
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        result = await session.exec(query)
        trip_types = result.all()
        
        return {
            "trip_types": trip_types,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@trip_types_router.post("/trip-types")
async def create_trip_type(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Create a new trip type"""
    try:
        trip_type = TripType(
            name=name,
            description=description,
            category=category
        )
        
        session.add(trip_type)
        await session.commit()
        await session.refresh(trip_type)
        
        return trip_type
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@trip_types_router.put("/trip-types/{trip_type_id}")
async def update_trip_type(
    trip_type_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update an existing trip type"""
    try:
        # Validate trip_type_id format
        trip_type_uuid = validate_uuid(trip_type_id, "trip type ID")
        
        query = select(TripType).where(TripType.id == trip_type_uuid)
        result = await session.exec(query)
        trip_type = result.first()
        
        if not trip_type:
            raise HTTPException(status_code=404, detail="Trip type not found")
        
        if name is not None:
            trip_type.name = name
        if description is not None:
            trip_type.description = description
        if category is not None:
            trip_type.category = category
        
        trip_type.updated_at = datetime.now()
        
        await session.commit()
        await session.refresh(trip_type)
        
        return trip_type
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@trip_types_router.delete("/trip-types/{trip_type_id}")
async def delete_trip_type(
    trip_type_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete a trip type"""
    try:
        # Validate trip_type_id format
        trip_type_uuid = validate_uuid(trip_type_id, "trip type ID")
        
        query = select(TripType).where(TripType.id == trip_type_uuid)
        result = await session.exec(query)
        trip_type = result.first()
        
        if not trip_type:
            raise HTTPException(status_code=404, detail="Trip type not found")
        
        await session.delete(trip_type)
        await session.commit()
        
        return {"message": "Trip type deleted successfully"}
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
