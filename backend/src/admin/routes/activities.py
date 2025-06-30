"""
Admin activities routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, Form
from typing import Optional
from datetime import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from ...db.main import get_session
from ...models.activity import Activity
from ..dependencies import admin_access_bearer
from .utils import validate_uuid

activities_router = APIRouter()


@activities_router.get("/activities")
async def get_activities(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term for activity name or type"),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    difficulty_level: Optional[str] = Query(None, description="Filter by difficulty level"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get paginated list of activities with filtering"""
    try:
        query = select(Activity)
        
        # Apply filters
        if search:
            query = query.where(
                Activity.name.ilike(f"%{search}%") |
                Activity.activity_type.ilike(f"%{search}%") |
                Activity.description.ilike(f"%{search}%")
            )
        
        if activity_type:
            query = query.where(Activity.activity_type.ilike(f"%{activity_type}%"))
            
        if difficulty_level:
            query = query.where(Activity.difficulty_level.ilike(f"%{difficulty_level}%"))
            
        if is_active is not None:
            query = query.where(Activity.is_active == is_active)
        
        # Get total count
        count_query = select(func.count(Activity.id))
        if search:
            count_query = count_query.where(
                Activity.name.ilike(f"%{search}%") |
                Activity.activity_type.ilike(f"%{search}%") |
                Activity.description.ilike(f"%{search}%")
            )
        if activity_type:
            count_query = count_query.where(Activity.activity_type.ilike(f"%{activity_type}%"))
        if difficulty_level:
            count_query = count_query.where(Activity.difficulty_level.ilike(f"%{difficulty_level}%"))
        if is_active is not None:
            count_query = count_query.where(Activity.is_active == is_active)
            
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await session.exec(query)
        activities = result.all()
        
        return {
            "activities": activities,
            "total": total,  
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activities: {str(e)}")


@activities_router.get("/activities/stats")
async def get_activities_stats(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get activity statistics"""
    try:
        # Total activities
        total_query = select(func.count(Activity.id))
        total_result = await session.exec(total_query)
        total_activities = total_result.one()
        
        # Active activities
        active_query = select(func.count(Activity.id)).where(Activity.is_active == True)
        active_result = await session.exec(active_query)
        active_activities = active_result.one()
        
        # Activities by type
        type_query = select(Activity.activity_type, func.count(Activity.id)).group_by(Activity.activity_type)
        type_result = await session.exec(type_query)
        activities_by_type = {activity_type: count for activity_type, count in type_result.all()}
        
        # Activities by difficulty
        difficulty_query = select(Activity.difficulty_level, func.count(Activity.id)).group_by(Activity.difficulty_level)
        difficulty_result = await session.exec(difficulty_query)
        activities_by_difficulty = {difficulty: count for difficulty, count in difficulty_result.all() if difficulty}
        
        return {
            "total_activities": total_activities,
            "active_activities": active_activities,
            "inactive_activities": total_activities - active_activities,
            "activities_by_type": activities_by_type,
            "activities_by_difficulty": activities_by_difficulty
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity stats: {str(e)}")


@activities_router.get("/activities/{activity_id}")
async def get_activity(
    activity_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get a specific activity by ID"""
    try:
        # Validate activity_id format
        activity_uuid = validate_uuid(activity_id, "activity ID")
        
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
            
        return activity
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity: {str(e)}")


@activities_router.post("/activities")
async def create_activity(
    name: str = Form(...),
    activity_type: str = Form(...),
    description: Optional[str] = Form(None),
    duration_hours: Optional[float] = Form(None),
    difficulty_level: Optional[str] = Form(None),
    age_restriction: Optional[str] = Form(None),
    is_active: bool = Form(True),
    featured_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Create a new activity"""
    try:
        # Handle featured image upload if provided
        featured_image_url = None
        if featured_image:
            from ...services.supabase_service import supabase_service
            featured_image_url = await supabase_service.upload_activity_image(featured_image)
        
        activity = Activity(
            name=name,
            activity_type=activity_type,
            description=description,
            duration_hours=duration_hours,
            difficulty_level=difficulty_level,
            age_restriction=age_restriction,
            featured_image=featured_image_url,
            is_active=is_active
        )
        
        session.add(activity)
        await session.commit()
        await session.refresh(activity)
        
        return activity
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating activity: {str(e)}")


@activities_router.put("/activities/{activity_id}")
async def update_activity(
    activity_id: str,
    name: Optional[str] = Form(None),
    activity_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    duration_hours: Optional[float] = Form(None),
    difficulty_level: Optional[str] = Form(None),
    age_restriction: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    featured_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update an existing activity"""
    try:
        # Validate activity_id format
        activity_uuid = validate_uuid(activity_id, "activity ID")
        
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Handle featured image upload if provided
        if featured_image:
            from ...services.supabase_service import supabase_service
            featured_image_url = await supabase_service.upload_activity_image(featured_image)
            activity.featured_image = featured_image_url
        
        if name is not None:
            activity.name = name
        if activity_type is not None:
            activity.activity_type = activity_type
        if description is not None:
            activity.description = description
        if duration_hours is not None:
            activity.duration_hours = duration_hours
        if difficulty_level is not None:
            activity.difficulty_level = difficulty_level
        if age_restriction is not None:
            activity.age_restriction = age_restriction
        if is_active is not None:
            activity.is_active = is_active
        
        activity.updated_at = datetime.now()
        
        await session.commit()
        await session.refresh(activity)
        
        return activity
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating activity: {str(e)}")


@activities_router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete an activity"""
    try:
        # Validate activity_id format
        activity_uuid = validate_uuid(activity_id, "activity ID")
        
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        await session.delete(activity)
        await session.commit()
        
        return {"message": "Activity deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting activity: {str(e)}")


@activities_router.post("/activities/upload-image")
async def upload_activity_image_standalone(
    image: UploadFile = File(...),
    token_data: dict = Depends(admin_access_bearer)
):
    """Upload an activity image to Supabase storage (standalone endpoint)"""
    try:
        from ...services.supabase_service import supabase_service
        image_url = await supabase_service.upload_activity_image(image)
        return {"image_url": image_url}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@activities_router.patch("/activities/{activity_id}/toggle-status")
async def toggle_activity_status(
    activity_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Toggle activity active status"""
    try:
        # Validate activity_id format
        activity_uuid = validate_uuid(activity_id, "activity ID")
        
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Toggle status
        activity.is_active = not activity.is_active
        await session.commit()
        await session.refresh(activity)
        
        return {
            "message": f"Activity {'activated' if activity.is_active else 'deactivated'} successfully",
            "activity": activity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error toggling activity status: {str(e)}")


@activities_router.get("/activities/types/list")
async def get_activity_types(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get list of all activity types"""
    try:
        query = select(Activity.activity_type).distinct()
        result = await session.exec(query)
        activity_types = [activity_type for activity_type in result.all() if activity_type]
        
        return {"activity_types": activity_types}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity types: {str(e)}")


@activities_router.get("/activities/difficulty-levels/list")
async def get_difficulty_levels(
    session: AsyncSession = Depends(get_session),
    user=Depends(admin_access_bearer)
):
    """Get list of all difficulty levels"""
    try:
        query = select(Activity.difficulty_level).distinct()
        result = await session.exec(query)
        difficulty_levels = [level for level in result.all() if level]
        
        return {"difficulty_levels": difficulty_levels}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching difficulty levels: {str(e)}")
    
        
