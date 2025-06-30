from pydantic import BaseModel, Field, EmailStr
import uuid
from datetime import datetime
from typing import Optional


class AdminCreateModel(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=6)
    role: str = Field(default="admin")


class AdminLoginModel(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)


class AdminModel(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AdminUpdateModel(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(default=None)
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    role: Optional[str] = Field(default=None)


class AdminPasswordChangeModel(BaseModel):
    current_password: str = Field(min_length=6)
    new_password: str = Field(min_length=6)
