from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class PackageImageCreateModel(BaseModel):
    image_url: str = Field(min_length=1, max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    display_order: int = Field(default=0, ge=0)
    is_primary: bool = Field(default=False)


class PackageImageUpdateModel(BaseModel):
    image_url: Optional[str] = Field(None, min_length=1, max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    display_order: Optional[int] = Field(None, ge=0)
    is_primary: Optional[bool] = None


class PackageImageResponseModel(BaseModel):
    id: uuid.UUID
    package_id: uuid.UUID
    image_url: str
    alt_text: Optional[str] = None
    display_order: int
    is_primary: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PackageImageBulkCreateModel(BaseModel):
    images: list[PackageImageCreateModel] = Field(min_items=1, max_items=20)
