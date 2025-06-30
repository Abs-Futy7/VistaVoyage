from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class BlogCategoryEnum(str, Enum):
    TRAVEL_GUIDE = "Travel Guide"
    BUDGET_TRAVEL = "Budget Travel"
    ADVENTURE = "Adventure"
    CULTURE = "Culture"
    FOOD = "Food"
    TIPS = "Tips"
    DESTINATION_REVIEW = "Destination Review"
    TRAVEL_STORY = "Travel Story"


class BlogStatusEnum(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class BlogCreateModel(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author_id: uuid.UUID
    excerpt: Optional[str] = None
    content: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=50)
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: BlogStatusEnum = BlogStatusEnum.DRAFT
    is_featured: bool = False


class BlogUpdateModel(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author_id: Optional[uuid.UUID] = None
    excerpt: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: Optional[BlogStatusEnum] = None
    is_featured: Optional[bool] = None


class BlogResponseModel(BaseModel):
    id: uuid.UUID
    title: str
    author_id: uuid.UUID
    excerpt: Optional[str] = None
    content: str
    category: str
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: BlogStatusEnum
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BlogListResponseModel(BaseModel):
    blogs: List[BlogResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int


class BlogSummaryResponseModel(BaseModel):
    """Summary response for blog listings without full content"""
    id: uuid.UUID
    title: str
    author_id: uuid.UUID
    excerpt: Optional[str] = None
    category: str
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: BlogStatusEnum
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
