"""
Admin blog routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...services.blog_service import blog_service
from ..dependencies import admin_access_bearer
from .utils import validate_uuid

blog_router = APIRouter()


@blog_router.get("/blogs")
async def get_blogs(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None,
    category: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """Get paginated list of blogs with filtering"""
    try:
        result = await blog_service.get_blogs(
            session=session,
            page=page,
            limit=limit,
            search=search,
            category=category,
            published_only=False  # Admin can see all blogs
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blog_router.delete("/blogs/{blog_id}")
async def delete_blog(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete a blog post and its associated image"""
    try:
        # Validate blog_id UUID
        blog_uuid = validate_uuid(blog_id, "blog ID")
        
        success = await blog_service.delete_blog(session, str(blog_uuid))
        if not success:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"message": "Blog deleted successfully"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@blog_router.patch("/blogs/{blog_id}/toggle-publish")
async def toggle_blog_publish_status(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Toggle the publish status of a blog"""
    try:
        # Validate blog_id UUID
        blog_uuid = validate_uuid(blog_id, "blog ID")
        
        blog = await blog_service.toggle_publish_status(session, str(blog_uuid))
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {
            "message": f"Blog {'published' if blog.is_published else 'unpublished'} successfully",
            "is_published": blog.is_published
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@blog_router.post("/blogs/upload-image")
async def upload_blog_image(
    image: UploadFile = File(...),
    token_data: dict = Depends(admin_access_bearer)
):
    """Upload a blog image to Supabase storage (standalone endpoint)"""
    try:
        from ...services.supabase_service import supabase_service
        image_url = await supabase_service.upload_blog_image(image)
        return {"image_url": image_url}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
