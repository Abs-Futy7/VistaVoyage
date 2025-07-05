
from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from ..models.booking import Booking
    from ..models.blog import Blog


class User(SQLModel, table=True):
    """User model for authentication and user management."""
    __tablename__ = "users"
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    
    email: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False,
            unique=True
        )
    )
    full_name: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    city: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=True
        )
    )
    country: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=True
        )
    )
    phone: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=True
        )
    )
    passport: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    password_hash: str = Field(
        exclude=True,
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    is_active: bool = Field(
        default=True,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=True
        )
    )
    bookings_count: int = Field(
        default=0,
        sa_column=Column(
            pg.INTEGER,
            nullable=False,
            default=0
        )
    )
    last_login_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
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
    bookings: List["Booking"] = Relationship(back_populates="user")
    blogs: List["Blog"] = Relationship(back_populates="author")

    def __repr__(self):
        return f"<User {self.email}>"