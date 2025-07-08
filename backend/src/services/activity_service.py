from typing import Optional, Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from fastapi import HTTPException, UploadFile
from ..models.activity import Activity
from ..schemas.activity_schemas import ActivityResponseModel, ActivityCreateModel, ActivityUpdateModel
from .supabase_service import supabase_service
import uuid


class ActivityService:
    async def get_activities(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        activity_type: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        is_active: Optional[bool] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        """Get paginated list of activities with advanced filtering"""
        query = select(Activity)
        
        # Apply filters
        if active_only or is_active is True:
            query = query.where(Activity.is_active == True)
        elif is_active is False:
            query = query.where(Activity.is_active == False)
            
        if search:
            search_term = f"%{search}%"
            query = query.where(
                Activity.name.ilike(search_term) |
                Activity.activity_type.ilike(search_term) |
                Activity.description.ilike(search_term)
            )
            
        if activity_type:
            query = query.where(Activity.activity_type.ilike(f"%{activity_type}%"))
            
        if difficulty_level:
            query = query.where(Activity.difficulty_level.ilike(f"%{difficulty_level}%"))
        
        # Get total count with same filters
        count_query = select(func.count(Activity.id))
        if active_only or is_active is True:
            count_query = count_query.where(Activity.is_active == True)
        elif is_active is False:
            count_query = count_query.where(Activity.is_active == False)
        if search:
            search_term = f"%{search}%"
            count_query = count_query.where(
                Activity.name.ilike(search_term) |
                Activity.activity_type.ilike(search_term) |
                Activity.description.ilike(search_term)
            )
        if activity_type:
            count_query = count_query.where(Activity.activity_type.ilike(f"%{activity_type}%"))
        if difficulty_level:
            count_query = count_query.where(Activity.difficulty_level.ilike(f"%{difficulty_level}%"))
            
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Activity.name.asc())
        
        result = await session.exec(query)
        activities = result.all()
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "activities": [ActivityResponseModel.model_validate(act) for act in activities],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "pages": total_pages  # For backward compatibility
        }

    async def get_activity_stats(self, session: AsyncSession) -> Dict[str, Any]:
        """Get activity statistics for admin dashboard"""
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

    async def get_activity_by_id(self, session: AsyncSession, activity_id: str) -> Optional[ActivityResponseModel]:
        """Get a specific activity by ID"""
        try:
            activity_uuid = uuid.UUID(activity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")
            
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            return None
            
        return ActivityResponseModel.model_validate(activity)

    async def create_activity(
        self, 
        session: AsyncSession, 
        activity_data: ActivityCreateModel,
        featured_image: Optional[UploadFile] = None
    ) -> ActivityResponseModel:
        """Create a new activity"""
        try:
            # Handle featured image upload if provided
            featured_image_url = None
            if featured_image:
                featured_image_url = await supabase_service.upload_activity_image(featured_image)
            
            activity = Activity(
                **activity_data.model_dump(exclude_unset=True),
                featured_image=featured_image_url
            )
            
            session.add(activity)
            await session.commit()
            await session.refresh(activity)
            
            return ActivityResponseModel.model_validate(activity)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating activity: {str(e)}")

    async def update_activity(
        self, 
        session: AsyncSession, 
        activity_id: str, 
        activity_data: ActivityUpdateModel,
        featured_image: Optional[UploadFile] = None
    ) -> Optional[ActivityResponseModel]:
        """Update an existing activity"""
        try:
            activity_uuid = uuid.UUID(activity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")
            
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            return None
        
        try:
            # Handle featured image upload if provided
            if featured_image:
                featured_image_url = await supabase_service.upload_activity_image(featured_image)
                activity.featured_image = featured_image_url
            
            # Update fields
            update_data = activity_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(activity, field, value)
            
            await session.commit()
            await session.refresh(activity)
            
            return ActivityResponseModel.model_validate(activity)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error updating activity: {str(e)}")

    async def delete_activity(self, session: AsyncSession, activity_id: str) -> bool:
        """Delete an activity"""
        try:
            activity_uuid = uuid.UUID(activity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")
            
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            return False
        
        try:
            await session.delete(activity)
            await session.commit()
            return True
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error deleting activity: {str(e)}")

    async def upload_activity_image(self, activity_id: str, image: UploadFile, session: AsyncSession) -> Optional[str]:
        """Upload an image for an activity"""
        try:
            activity_uuid = uuid.UUID(activity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")
            
        query = select(Activity).where(Activity.id == activity_uuid)
        result = await session.exec(query)
        activity = result.first()
        
        if not activity:
            return None
        
        try:
            image_url = await supabase_service.upload_activity_image(image)
            activity.featured_image = image_url
            await session.commit()
            await session.refresh(activity)
            return image_url
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")


activity_service = ActivityService()
