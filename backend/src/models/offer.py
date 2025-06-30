from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .package import Package
    from .promo_code import PromoCode


class Offer(SQLModel, table=True):
    """Offer model for special promotions and discounts."""
    __tablename__ = "offers"
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    title: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        )
    )
    
    description: str = Field(
        sa_column=Column(
            pg.TEXT,
            nullable=False
        )
    )
    
    discount_percentage: Optional[float] = Field(
        default=None,
        sa_column=Column(
            pg.NUMERIC(5, 2),
            nullable=True
        )
    )
    
    discount_amount: Optional[float] = Field(
        default=None,
        sa_column=Column(
            pg.NUMERIC(10, 2),
            nullable=True
        )
    )
    
    max_usage_per_user: Optional[int] = Field(
        default=None,
        sa_column=Column(
            pg.INTEGER,
            nullable=True
        )
    )
    
    total_usage_limit: Optional[int] = Field(
        default=None,
        sa_column=Column(
            pg.INTEGER,
            nullable=True
        )
    )
    
    valid_from: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False
        )
    )
    
    valid_until: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
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
    packages: List["Package"] = Relationship(back_populates="offer")
    promo_codes: List["PromoCode"] = Relationship(back_populates="offer")

    def __repr__(self):
        return f"<Offer {self.title}>"

    @property
    def is_valid(self) -> bool:
        """Check if the offer is currently valid."""
        now = datetime.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.total_usage_limit is None or self.current_usage_count < self.total_usage_limit)
        )
