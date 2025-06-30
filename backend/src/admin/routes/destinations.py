"""
Admin destinations routes
"""
from fastapi import APIRouter, HTTPException, Depends, Form, UploadFile, File
from typing import Optional
from datetime import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from ...db.main import get_session
from ...models.destination import Destination
from ..dependencies import admin_access_bearer
from .utils import validate_uuid

destinations_router = APIRouter()


@destinations_router.get("/destinations")
async def get_destinations(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None,
    country: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """Get paginated list of destinations with filtering"""
    try:
        query = select(Destination)
        
        if search:
            query = query.where(
                Destination.name.ilike(f"%{search}%") |
                Destination.country.ilike(f"%{search}%") |
                Destination.city.ilike(f"%{search}%")
            )
        
        if country:
            query = query.where(Destination.country.ilike(f"%{country}%"))
        
        # Get total count
        count_query = select(func.count(Destination.id))
        if search:
            count_query = count_query.where(
                Destination.name.ilike(f"%{search}%") |
                Destination.country.ilike(f"%{search}%") |
                Destination.city.ilike(f"%{search}%")
            )
        if country:
            count_query = count_query.where(Destination.country.ilike(f"%{country}%"))
        
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        query = query.offset((page - 1) * limit).limit(limit)
        result = await session.exec(query)
        destinations = result.all()
        
        return {
            "destinations": destinations,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@destinations_router.post("/destinations")
async def create_destination(
    name: str = Form(...),
    country: str = Form(...),
    city: str = Form(...),
    description: Optional[str] = Form(None),
    climate: Optional[str] = Form(None),
    best_time_to_visit: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    is_active: bool = Form(True),
    featured_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Create a new destination"""
    try:
        # Handle featured image upload if provided
        featured_image_url = None
        if featured_image:
            from ...services.supabase_service import supabase_service
            featured_image_url = await supabase_service.upload_destination_image(featured_image)
        
        destination = Destination(
            name=name,
            country=country,
            city=city,
            description=description,
            climate=climate,
            best_time_to_visit=best_time_to_visit,
            timezone=timezone,
            featured_image=featured_image_url,
            is_active=is_active
        )
        
        session.add(destination)
        await session.commit()
        await session.refresh(destination)
        
        return destination
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@destinations_router.put("/destinations/{destination_id}")
async def update_destination(
    destination_id: str,
    name: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    climate: Optional[str] = Form(None),
    best_time_to_visit: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    featured_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update an existing destination"""
    try:
        # Validate destination_id format
        destination_uuid = validate_uuid(destination_id, "destination ID")
        
        query = select(Destination).where(Destination.id == destination_uuid)
        result = await session.exec(query)
        destination = result.first()
        
        if not destination:
            raise HTTPException(status_code=404, detail="Destination not found")
        
        # Handle featured image upload if provided
        if featured_image:
            from ...services.supabase_service import supabase_service
            featured_image_url = await supabase_service.upload_destination_image(featured_image)
            destination.featured_image = featured_image_url
        
        if name is not None:
            destination.name = name
        if country is not None:
            destination.country = country
        if city is not None:
            destination.city = city
        if description is not None:
            destination.description = description
        if climate is not None:
            destination.climate = climate
        if best_time_to_visit is not None:
            destination.best_time_to_visit = best_time_to_visit
        if timezone is not None:
            destination.timezone = timezone
        if is_active is not None:
            destination.is_active = is_active
        
        destination.updated_at = datetime.now()
        
        await session.commit()
        await session.refresh(destination)
        
        return destination
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@destinations_router.delete("/destinations/{destination_id}")
async def delete_destination(
    destination_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete a destination"""
    try:
        # Validate destination_id format
        destination_uuid = validate_uuid(destination_id, "destination ID")
        
        query = select(Destination).where(Destination.id == destination_uuid)
        result = await session.exec(query)
        destination = result.first()
        
        if not destination:
            raise HTTPException(status_code=404, detail="Destination not found")
        
        await session.delete(destination)
        await session.commit()
        
        return {"message": "Destination deleted successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@destinations_router.post("/destinations/upload-image")
async def upload_destination_image(
    image: UploadFile = File(...),
    token_data: dict = Depends(admin_access_bearer)
):
    """Upload a destination image to Supabase storage (standalone endpoint)"""
    try:
        from ...services.supabase_service import supabase_service
        image_url = await supabase_service.upload_destination_image(image)
        return {"image_url": image_url}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
