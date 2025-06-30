from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
import uuid


class PackageActivityLink(SQLModel, table=True):
    """Association table for many-to-many relationship between packages and activities."""
    __tablename__ = "package_activities"
    
    package_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("packages.id"),
            primary_key=True
        )
    )
    
    activity_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("activities.id"),
            primary_key=True
        )
    )
    
    is_included: bool = Field(
        default=True,
        sa_column=Column(
            pg.BOOLEAN,
            nullable=False,
            default=True
        )
    )
    order_index: int = Field(
        default=0,
        sa_column=Column(
            pg.INTEGER,
            nullable=False,
            default=0
        )
    )
