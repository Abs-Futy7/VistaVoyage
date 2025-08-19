
from sqlmodel import SQLModel, Field, Column, Relationship
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import UniqueConstraint, ForeignKey
import uuid
from datetime import datetime, date
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .offer import Offer
    from ..models.booking import Booking


class PromoCode(SQLModel, table=True):
    """Promo code model for discount codes."""
    __tablename__ = "promo_codes"
    __table_args__ = (
        UniqueConstraint("code", name="promo_codes_code_key"),
    )
    
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            pg.UUID(as_uuid=True),
            nullable=False,
            primary_key=True
        )
    )
    
    code: str = Field(
        sa_column=Column(
            pg.VARCHAR(50),
            nullable=False,
            unique=True
        )
    )
    
    # Removed offer_id field and offer relationship
    
    # Standalone promo code fields

    created_by: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID(as_uuid=True),
            ForeignKey("admins.id"),
            nullable=False
        )
    )
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    
    discount_type: str = Field(
        default="percentage",
        sa_column=Column(
            pg.VARCHAR(20),
            nullable=False,
            default="percentage"
        )
    )
    
    discount_value: float = Field(
        default=0.0,
        sa_column=Column(
            pg.FLOAT,
            nullable=False,
            default=0.0
        )
    )
    
    minimum_amount: Optional[float] = Field(
        default=None,
        sa_column=Column(
            pg.FLOAT,
            nullable=True
        )
    )
    
    maximum_discount: Optional[float] = Field(
        default=None,
        sa_column=Column(
            pg.FLOAT,
            nullable=True
        )
    )
    
    start_date: date = Field(
        default_factory=lambda: datetime.utcnow().date(),
        sa_column=Column(
            pg.DATE,
            nullable=False
        )
    )
    
    expiry_date: date = Field(
        sa_column=Column(
            pg.DATE,
            nullable=False
        )
    )
    
    usage_limit: Optional[int] = Field(
        default=None,
        sa_column=Column(
            pg.INTEGER,
            nullable=True
        )
    )
    
    used_count: int = Field(
        default=0,
        sa_column=Column(
            pg.INTEGER,
            nullable=False,
            default=0
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
        default_factory=datetime.utcnow,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False
        )
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            onupdate=datetime.utcnow
        )
    )
    
    # Removed offer relationship
    bookings: list["Booking"] = Relationship(back_populates="promo_code")

    def __repr__(self):
        return f"<PromoCode {self.code}>"

    @property
    def is_valid(self) -> bool:
        """Check if the promo code is currently valid."""
        current_date = datetime.utcnow().date()
        
        # Check basic validity
        if not self.is_active:
            return False
            
        # Check date range
        if current_date < self.start_date or current_date > self.expiry_date:
            return False
            
        # Check usage limits
        if self.usage_limit is not None and self.used_count >= self.usage_limit:
            return False
            
        # If linked to offer, check offer validity
        if self.offer_id and self.offer:
            return self.offer.is_valid
            
        return True
    
    def increment_usage(self) -> None:
        """Increment the usage count of the promo code."""
        self.used_count += 1
    
    @property 
    def remaining_uses(self) -> Optional[int]:
        """Get the remaining uses for this promo code."""
        if self.usage_limit is None:
            return None
        return max(0, self.usage_limit - self.used_count)
    
    def calculate_discount(self, amount: float) -> tuple[float, float]:
        """
        Calculate discount amount and final price.
        Returns: (discount_amount, final_amount)
        """
        if not self.is_valid:
            return 0.0, amount
            
        # Check minimum amount requirement
        if self.minimum_amount and amount < self.minimum_amount:
            return 0.0, amount
            
        # Calculate discount based on type
        if self.discount_type == "percentage":
            discount_amount = amount * (self.discount_value / 100)
        elif self.discount_type == "fixed":
            discount_amount = self.discount_value
        else:
            return 0.0, amount
            
        # Apply maximum discount limit
        if self.maximum_discount:
            discount_amount = min(discount_amount, self.maximum_discount)
            
        # Ensure discount doesn't exceed the amount
        discount_amount = min(discount_amount, amount)
        
        final_amount = amount - discount_amount
        return discount_amount, final_amount
