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
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
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
        default="admin",
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False,
            default="admin"
        )
    )
    
    permissions: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(
            pg.ARRAY(pg.VARCHAR),
            nullable=True
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
    
    is_super_admin: bool = Field(
        default=False,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=False
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

    def __repr__(self):
        return f"<Admin {self.username}>"
