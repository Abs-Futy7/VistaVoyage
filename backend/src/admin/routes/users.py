"""
Admin user management routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...services.admin_user_service import admin_user_service
from ..dependencies import admin_access_bearer

users_router = APIRouter()


@users_router.get("/users")
async def get_users(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """Get paginated list of users with filtering"""
    try:
        result = await admin_user_service.get_users(
            session=session,
            page=page,
            limit=limit,
            search=search,
            active_only=None  # Show all users
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@users_router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Toggle the active status of a user"""
    try:
        user = await admin_user_service.toggle_user_status(session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@users_router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete a user (admin only - be careful!)"""
    try:
        success = await admin_user_service.delete_user(session, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
