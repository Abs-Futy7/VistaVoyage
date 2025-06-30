from pydantic import BaseModel,Field, EmailStr
import uuid
from datetime import datetime
from datetime import date
from typing import Optional


class UserCreateModel(BaseModel):
    email: str = Field(max_length=30) # Email must be a valid email format
    full_name: str = Field(min_length=1, max_length=255)  # Full name must be between 1 and 255 characters
    city: str = Field(default=None, nullable=True)  # City can be optional
    country: str = Field(default=None, nullable=True)  # Country can be optional
    phone: str = Field(default=None, nullable=True)  # Phone can be optional
    passport: str = Field(min_length=1, max_length=255)  # Passport must be between 1 and 255 characters
    password: str  = Field(min_length=4) # Password must be between 6 and 128 characters


class UserModel(BaseModel):
    uid: uuid.UUID
    email: EmailStr  # Email must be a valid email format
    full_name: str = Field(min_length=1, max_length=255)  #
    city: Optional[str] = None  # City can be optional
    country: Optional[str] = None  # Country can be optional
    phone: Optional[str] = None  # Phone can be optional
    passport: str = Field(min_length=1, max_length=255)  # Passport
    created_at: datetime = Field(default_factory=datetime.now)  # Created at timestamp
    updated_at: datetime = Field(default_factory=datetime.now)  # Updated at timestamp
    

class UserLoginModel(BaseModel):
    email: str = Field(max_length=30)  # Email must be a valid email format
    password: str = Field(min_length=4)  # Password must be at least 4 characters long


class UserUpdateModel(BaseModel):
    email: Optional[str] = Field(default=None, max_length=30)  # Email must be a valid email format
    full_name: Optional[str] = Field(min_length=1, max_length=255)  # Full name must be between 1 and 255 characters
    city: Optional[str] = Field(default=None, nullable=True)  # City can be optional
    country: Optional[str] = Field(default=None, nullable=True)  # Country can be optional
    phone: Optional[str] = Field(default=None, nullable=True)  # Phone can be optional
    passport: Optional[str] = Field(min_length=1, max_length=255)  # Passport must be between 1 and 255 characters