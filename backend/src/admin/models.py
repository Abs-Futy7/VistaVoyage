from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from ..models.blog import Blog


class Admin(SQLModel, table=True):
    """Admin model for admin authentication and management."""
    __tablename__ = "admins"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    username: str = Field(
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False,
            unique=True
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
    
    password_hash: str = Field(
        exclude=True,
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    
    role: str = Field(
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False
        )
    )

    is_active: bool = Field(
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False
        )
    )

    def __repr__(self):
        return f"<Admin {self.username}>"
