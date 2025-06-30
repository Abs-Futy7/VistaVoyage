"""
Admin blog routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from ...db.main import get_session
from ...services.blog_service import blog_service
from ...schemas.blog_schemas import BlogCreateModel, BlogUpdateModel
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


@blog_router.post("/blogs")
async def create_blog(
    title: str = Form(...),
    author_id: str = Form(...),  # UUID as string
    excerpt: Optional[str] = Form(None),
    content: str = Form(...),
    category: str = Form(...),
    tags: Optional[str] = Form(None),  # Comma-separated string
    status: str = Form("draft"),
    is_featured: bool = Form(False),
    cover_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Create a new blog post with optional image upload"""
    try:
        # Validate author_id UUID
        author_uuid = validate_uuid(author_id, "author ID")
        
        # Parse tags from comma-separated string
        tags_list = None
        if tags:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        blog_data = BlogCreateModel(
            title=title,
            author_id=author_uuid,
            excerpt=excerpt,
            content=content,
            category=category,
            tags=tags_list,
            status=status,
            is_featured=is_featured
        )
        
        new_blog = await blog_service.create_blog(
            session=session,
            blog_data=blog_data,
            cover_image=cover_image
        )
        
        return new_blog
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@blog_router.put("/blogs/{blog_id}")
async def update_blog(
    blog_id: str,
    title: Optional[str] = Form(None),
    author_id: Optional[str] = Form(None),  # UUID as string
    excerpt: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated string
    status: Optional[str] = Form(None),
    is_featured: Optional[bool] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update an existing blog post"""
    try:
        # Validate blog_id UUID
        blog_uuid = validate_uuid(blog_id, "blog ID")
        
        # Validate author_id UUID if provided
        author_uuid = None
        if author_id is not None:
            author_uuid = validate_uuid(author_id, "author ID")
        
        # Parse tags from comma-separated string
        tags_list = None
        if tags is not None:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        # Build update data - only include fields that are provided
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if author_uuid is not None:
            update_data["author_id"] = author_uuid
        if excerpt is not None:
            update_data["excerpt"] = excerpt
        if content is not None:
            update_data["content"] = content
        if category is not None:
            update_data["category"] = category
        if tags is not None:
            update_data["tags"] = tags_list
        if status is not None:
            update_data["status"] = status
        if is_featured is not None:
            update_data["is_featured"] = is_featured
        
        blog_update = BlogUpdateModel(**update_data)
        
        updated_blog = await blog_service.update_blog(
            session=session,
            blog_id=str(blog_uuid),
            blog_data=blog_update,
            cover_image=cover_image
        )
        
        if not updated_blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return updated_blog
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
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
