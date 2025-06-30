from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class ActivityDifficultyEnum(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
    EXPERT = "expert"


class ActivityCategoryEnum(str, Enum):
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    RECREATIONAL = "recreational"
    EDUCATIONAL = "educational"
    SPIRITUAL = "spiritual"
    NATURE = "nature"
    SPORTS = "sports"
    ENTERTAINMENT = "entertainment"


class ActivityCreateModel(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    activity_type: str = Field(min_length=1, max_length=100)
    duration_hours: Optional[float] = Field(None, gt=0)
    difficulty_level: Optional[str] = Field(None, max_length=20)
    age_restriction: Optional[str] = Field(None, max_length=50)
    featured_image: Optional[str] = None
    is_active: bool = True


class ActivityUpdateModel(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    activity_type: Optional[str] = Field(None, min_length=1, max_length=100)
    duration_hours: Optional[float] = Field(None, gt=0)
    difficulty_level: Optional[str] = Field(None, max_length=20)
    age_restriction: Optional[str] = Field(None, max_length=50)
    featured_image: Optional[str] = None
    is_active: Optional[bool] = None


class ActivityResponseModel(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    activity_type: str
    duration_hours: Optional[float] = None
    difficulty_level: Optional[str] = None
    age_restriction: Optional[str] = None
    featured_image: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ActivityListResponseModel(BaseModel):
    activities: List[ActivityResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int
