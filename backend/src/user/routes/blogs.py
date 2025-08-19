"""
Public blog routes for users
"""
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
import uuid

from ...db.main import get_session
from ...models.blog import Blog, BlogStatus
from ...schemas.blog_schemas import (
    BlogSummaryResponseModel,
    BlogResponseModel,
    BlogListResponseModel,
    BlogCreateModel,
    BlogUpdateModel
)
from ...services.blog_service import blog_service
from ...auth.dependencies import get_current_user
from ...auth.models import User

blogs_router = APIRouter()


@blogs_router.get("/blogs")
async def get_public_blogs(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category"),
    session: AsyncSession = Depends(get_session),
):
    """Get published blogs with filtering (only published blogs visible to public)"""
    try:
        result = await blog_service.get_blogs(
            session=session,
            page=page,
            limit=limit,
            search=search,
            category=category,
            published_only=True  # Only show published blogs to public
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.get("/blogs/{blog_id}")
async def get_blog_by_id(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get a specific published blog by ID"""
    try:
        blog_data = await blog_service.get_blog_by_id(session, blog_id)
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Only show published blogs to public
        if blog_data.get('status') != BlogStatus.PUBLISHED.value:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return blog_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# User blog management routes (authenticated users only)

@blogs_router.post("/my-blogs", response_model=BlogResponseModel)
async def create_user_blog(
    title: str = Form(...),
    excerpt: Optional[str] = Form(None),
    content: str = Form(...),
    category: str = Form(...),
    tags: Optional[str] = Form(None),  # Comma-separated string
    cover_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new blog post by authenticated user"""
    try:
        # Parse tags from comma-separated string
        tags_list = None
        if tags:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # Create blog data with current user as author
        blog_data = BlogCreateModel(
            title=title,
            author_id=current_user.uid,  # Use current user's ID
            excerpt=excerpt,
            content=content,
            category=category,
            tags=tags_list,
            status="draft",  # User blogs start as draft
            is_featured=False  # Users can't create featured blogs
        )
        
        new_blog = await blog_service.create_blog(
            session=session,
            blog_data=blog_data,
            cover_image=cover_image
        )
        
        return BlogResponseModel.model_validate(new_blog)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.get("/my-blogs", response_model=BlogListResponseModel)
async def get_user_blogs(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get blogs created by the authenticated user"""
    try:
        # Get user's blogs using direct query
        query = select(Blog).where(Blog.author_id == current_user.uid)
        
        # Apply filters
        if search:
            query = query.where(Blog.title.contains(search))
        if category:
            query = query.where(Blog.category == category)
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Blog.created_at.desc())
        
        # Execute query
        result = await session.exec(query)
        user_blogs = result.all()
        
        # Get total count
        count_query = select(Blog).where(Blog.author_id == current_user.uid)
        if search:
            count_query = count_query.where(Blog.title.contains(search))
        if category:
            count_query = count_query.where(Blog.category == category)
        
        from sqlmodel import func
        total_result = await session.exec(select(func.count(Blog.id)).select_from(count_query.subquery()))
        total = total_result.first()
        
        return BlogListResponseModel(
            blogs=user_blogs,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit if total else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.put("/my-blogs/{blog_id}", response_model=BlogResponseModel)
async def update_user_blog(
    blog_id: str,
    title: Optional[str] = Form(None),
    excerpt: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated string
    cover_image: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a blog post by authenticated user (only their own blogs)"""
    try:
        # Get the blog first
        blog_data = await blog_service.get_blog_by_id(session, blog_id)
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Check if user owns this blog
        if blog_data.get('author_id') != current_user.uid:
            raise HTTPException(status_code=403, detail="You can only update your own blogs")
        
        # Parse tags from comma-separated string
        tags_list = None
        if tags is not None:
            tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
        
        # Build update data - only include fields that are provided
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if excerpt is not None:
            update_data["excerpt"] = excerpt
        if content is not None:
            update_data["content"] = content
        if category is not None:
            update_data["category"] = category
        if tags is not None:
            update_data["tags"] = tags_list
        
        blog_update = BlogUpdateModel(**update_data)
        
        updated_blog = await blog_service.update_blog(
            session=session,
            blog_id=blog_id,
            blog_data=blog_update,
            cover_image=cover_image
        )
        
        return BlogResponseModel.model_validate(updated_blog)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.delete("/my-blogs/{blog_id}")
async def delete_user_blog(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a blog post by authenticated user (only their own blogs)"""
    try:
        # Get the blog first
        blog_data = await blog_service.get_blog_by_id(session, blog_id)
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Check if user owns this blog
        if blog_data.get('author_id') != current_user.uid:
            raise HTTPException(status_code=403, detail="You can only delete your own blogs")
        
        success = await blog_service.delete_blog(session, blog_id)
        if not success:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"message": "Blog deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.patch("/my-blogs/{blog_id}/publish")
async def toggle_user_blog_publish(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Toggle publish status of user's blog (draft <-> published)"""
    try:
        # Get the blog first
        blog_data = await blog_service.get_blog_by_id(session, blog_id)
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Check if user owns this blog
        if blog_data.get('author_id') != current_user.uid:
            raise HTTPException(status_code=403, detail="You can only publish your own blogs")
        
        updated_blog = await blog_service.toggle_publish_status(session, blog_id)
        
        return {
            "message": f"Blog {'published' if updated_blog.is_published else 'unpublished'} successfully",
            "is_published": updated_blog.is_published
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.get("/my-blogs/{blog_id}", response_model=BlogResponseModel)
async def get_user_blog_by_id(
    blog_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific blog by ID (user's own blog, any status)"""
    try:
        blog_data = await blog_service.get_blog_by_id(session, blog_id)
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Check if user owns this blog
        if blog_data.get('author_id') != current_user.uid:
            raise HTTPException(status_code=403, detail="You can only view your own blogs")
        
        return BlogResponseModel.model_validate(blog_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Additional endpoints for better user experience

@blogs_router.get("/blogs/featured", response_model=BlogListResponseModel)
async def get_featured_blogs(
    limit: int = Query(6, ge=1, le=20, description="Number of featured blogs to return"),
    session: AsyncSession = Depends(get_session),
):
    """Get featured published blogs"""
    try:
        # Get featured blogs using direct SQL query
        query = select(Blog).where(
            Blog.is_featured == True,
            Blog.status == BlogStatus.PUBLISHED
        ).order_by(Blog.created_at.desc()).limit(limit)
        
        result = await session.exec(query)
        featured_blogs = result.all()
        
        return BlogListResponseModel(
            blogs=featured_blogs,
            total=len(featured_blogs),
            page=1,
            limit=limit,
            total_pages=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.get("/blogs/categories", response_model=list[str])
async def get_blog_categories(
    session: AsyncSession = Depends(get_session),
):
    """Get all available blog categories from published blogs"""
    try:
        query = select(Blog.category).where(
            Blog.status == BlogStatus.PUBLISHED
        ).distinct()
        
        result = await session.exec(query)
        categories = result.all()
        
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blogs_router.get("/blogs/recent", response_model=BlogListResponseModel)
async def get_recent_blogs(
    limit: int = Query(5, ge=1, le=10, description="Number of recent blogs to return"),
    session: AsyncSession = Depends(get_session),
):
    """Get most recent published blogs"""
    try:
        query = select(Blog).where(
            Blog.status == BlogStatus.PUBLISHED
        ).order_by(Blog.published_at.desc()).limit(limit)
        
        result = await session.exec(query)
        recent_blogs = result.all()
        
        return BlogListResponseModel(
            blogs=recent_blogs,
            total=len(recent_blogs),
            page=1,
            limit=limit,
            total_pages=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


