from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from ..auth.models import User


class BlogStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class BlogCategory(str, Enum):
    TRAVEL_GUIDE = "Travel Guide"
    BUDGET_TRAVEL = "Budget Travel"
    ADVENTURE = "Adventure"
    CULTURE = "Culture"
    FOOD = "Food"
    TIPS = "Tips"
    DESTINATION_REVIEW = "Destination Review"
    TRAVEL_STORY = "Travel Story"


class Blog(SQLModel, table=True):
    """Blog model for travel blog posts."""
    __tablename__ = "blogs"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    title: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    author_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.uid"),
            nullable=False
        )
    )
    
    content: str = Field(
        sa_column=Column(
            pg.TEXT,
            nullable=False
        )
    )
    
    excerpt: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    status: BlogStatus = Field(
        default=BlogStatus.DRAFT,
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=False,
            default="draft"
        )
    )
    
    published_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
        )
    )
    
    category: str = Field(
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False
        )
    )
    
    tags: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(
            pg.ARRAY(pg.VARCHAR),
            nullable=True
        )
    )
    
    cover_image: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    is_featured: bool = Field(
        default=False,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=False
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            default=datetime.now,
            onupdate=datetime.now,
            nullable=False
        )
    )
    
    # Relationships
    author: "User" = Relationship(back_populates="blogs")

    def __repr__(self):
        return f"<Blog {self.title}>"

    @property
    def is_published(self) -> bool:
        """Check if the blog post is published."""
        return self.status == BlogStatus.PUBLISHED and self.published_at is not None
