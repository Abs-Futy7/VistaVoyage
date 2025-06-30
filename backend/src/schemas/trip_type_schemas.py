from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class TripTypeCreateModel(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    category: str = Field(min_length=1, max_length=50)
    is_active: bool = True


class TripTypeUpdateModel(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    is_active: Optional[bool] = None


class TripTypeResponseModel(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    category: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TripTypeListResponseModel(BaseModel):
    trip_types: List[TripTypeResponseModel]
    total: int
    page: int
    limit: int
    total_pages: int
