from pydantic import BaseModel,Field, EmailStr
import uuid
from datetime import datetime
from datetime import date
from typing import Optional


class UserCreateModel(BaseModel):
    email: str = Field(max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    passport: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=4)


class UserModel(BaseModel):
    uid: uuid.UUID
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    passport: str
    is_active: bool
    bookings_count: int
    created_at: datetime
    updated_at: datetime
    

class UserLoginModel(BaseModel):
    email: str = Field(max_length=30)  # Email must be a valid email format
    password: str = Field(min_length=4)  # Password must be at least 4 characters long


class UserUpdateModel(BaseModel):
    email: Optional[str] = Field(default=None, max_length=255)
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    passport: Optional[str] = Field(default=None, min_length=1, max_length=255)
    is_active: Optional[bool] = None
    bookings_count: Optional[int] = None