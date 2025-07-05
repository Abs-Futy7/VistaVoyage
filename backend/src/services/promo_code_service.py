from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, Tuple, List
from datetime import datetime
from ..models.promo_code import PromoCode
from ..models.offer import Offer
from ..schemas.promo_code_schemas import PromoCodeValidationResponseModel, PromoCodeResponseModel
import uuid
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


class PromoCodeService:
    """Service for handling promo code operations."""

    @staticmethod
    async def get_all_promo_codes(
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        active_only: bool = True
    ) -> Tuple[List[PromoCodeResponseModel], int]:
        """
        Get all promo codes with pagination and optional active filter.
        
        Args:
            session: Database session
            page: Page number for pagination
            limit: Number of promo codes per page
            active_only: Filter for active promo codes
            
        Returns:
            Tuple of (list of PromoCode, total count)
        """
        try:
            statement = (
                select(PromoCode)
                .options(selectinload(PromoCode.offer))
                .order_by(PromoCode.created_at.desc())
            )
            if active_only:
                statement = statement.where(PromoCode.is_active == True)
            total_count = (await session.exec(select(func.count(PromoCode.id)))).one()
            total_count = total_count[0] if isinstance(total_count, tuple) else total_count
            offset = (page - 1) * limit
            statement = statement.offset(offset).limit(limit)
            promo_codes = (await session.exec(statement)).all()
            promo_codes_serialized = []
            for pc in promo_codes:
                promo_dict = pc.__dict__.copy()
                if hasattr(pc, 'offer') and pc.offer:
                    offer = pc.offer
                    promo_dict['offer_id'] = offer.id
                promo_dict['discount_type'] = getattr(pc, 'discount_type', None)
                promo_dict['discount_value'] = getattr(pc, 'discount_value', None)
                promo_dict['is_valid'] = getattr(pc, 'is_valid', True)
                promo_dict['remaining_uses'] = getattr(pc, 'remaining_uses', None)
                promo_codes_serialized.append(PromoCodeResponseModel.model_validate(promo_dict))
            return promo_codes_serialized, total_count
        except SQLAlchemyError as e:
            await session.rollback()
            raise e

    @staticmethod
    async def validate_promo_code(
        session: AsyncSession,
        code: Optional[str] = None,
        promo_code_id: Optional[uuid.UUID] = None,
        booking_amount: float = 0.0,
        package_id: Optional[uuid.UUID] = None
    ) -> PromoCodeValidationResponseModel:
        """
        Validate a promo code by either code string or ID.
        
        Args:
            session: Database session
            code: Promo code string
            promo_code_id: Promo code UUID
            booking_amount: Original booking amount
            package_id: Package ID (for future package-specific validations)
            
        Returns:
            PromoCodeValidationResponseModel with validation results
        """
        try:
            statement = select(PromoCode).options(selectinload(PromoCode.offer))
            if code:
                statement = statement.where(PromoCode.code == code.upper())
            elif promo_code_id:
                statement = statement.where(PromoCode.id == promo_code_id)
            else:
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message="No promo code provided",
                    discount_amount=0.0,
                    final_amount=booking_amount
                )
            promo_code = (await session.exec(statement)).first()
            if not promo_code:
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message="Promo code not found",
                    discount_amount=0.0,
                    final_amount=booking_amount
                )
            # Check validity
            current_date = datetime.utcnow().date()
            is_valid = (promo_code.is_active and 
                       (not promo_code.start_date or promo_code.start_date <= current_date) and
                       (not promo_code.expiry_date or promo_code.expiry_date >= current_date))
            
            # Check usage limits
            if is_valid and hasattr(promo_code, 'max_uses') and promo_code.max_uses is not None:
                if hasattr(promo_code, 'current_uses') and promo_code.current_uses is not None:
                    if promo_code.current_uses >= promo_code.max_uses:
                        is_valid = False
            
            if not is_valid:
                message = "Promo code is inactive"
                if not promo_code.is_active:
                    message = "Promo code is inactive"
                elif promo_code.start_date and promo_code.start_date > current_date:
                    message = "Promo code is not yet active"
                elif promo_code.expiry_date and promo_code.expiry_date < current_date:
                    message = "Promo code has expired"
                
                # Check usage limits for more specific message
                if hasattr(promo_code, 'max_uses') and promo_code.max_uses is not None:
                    if hasattr(promo_code, 'current_uses') and promo_code.current_uses is not None:
                        if promo_code.current_uses >= promo_code.max_uses:
                            message = "Promo code has reached its usage limit"
                
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message=message,
                    discount_amount=0.0,
                    final_amount=booking_amount,
                    promo_code_id=promo_code.id,
                    offer_title=getattr(promo_code.offer, 'title', None),
                    remaining_uses=getattr(promo_code, 'remaining_uses', None)
                )
            # Calculate discount
            discount_amount = 0.0
            if promo_code.discount_type == "percentage":
                discount_amount = (booking_amount * (promo_code.discount_value or 0)) / 100
                if promo_code.maximum_discount:
                    discount_amount = min(discount_amount, promo_code.maximum_discount)
            elif promo_code.discount_type == "fixed":
                discount_amount = min(promo_code.discount_value or 0.0, booking_amount)
            final_amount = max(0.0, booking_amount - discount_amount)
            return PromoCodeValidationResponseModel(
                is_valid=True,
                message="Promo code is valid",
                discount_amount=discount_amount,
                discount_percentage=promo_code.discount_value if promo_code.discount_type == "percentage" else None,
                final_amount=final_amount,
                promo_code_id=promo_code.id,
                offer_title=getattr(promo_code.offer, 'title', None),
                remaining_uses=getattr(promo_code, 'remaining_uses', None)
            )
        except SQLAlchemyError as e:
            await session.rollback()
            return PromoCodeValidationResponseModel(
                is_valid=False,
                message=f"Database error: {str(e)}",
                discount_amount=0.0,
                final_amount=booking_amount
            )
        except Exception as e:
            return PromoCodeValidationResponseModel(
                is_valid=False,
                message=f"Validation error: {str(e)}",
                discount_amount=0.0,
                final_amount=booking_amount
            )
    
    @staticmethod
    def _get_promo_code_by_string(session: Session, code: str) -> Optional[PromoCode]:
        """Get promo code by string."""
        statement = (
            select(PromoCode)
            .where(PromoCode.code == code.upper())
            .join(Offer)
        )
        return session.exec(statement).first()
    
    @staticmethod
    def _get_promo_code_by_id(session: Session, promo_code_id: uuid.UUID) -> Optional[PromoCode]:
        """Get promo code by ID."""
        statement = (
            select(PromoCode)
            .where(PromoCode.id == promo_code_id)
            .join(Offer)
        )
        return session.exec(statement).first()
    
    @staticmethod
    def _calculate_discount(offer: Offer, booking_amount: float) -> Tuple[float, float]:
        """
        Calculate discount amount and final amount.
        
        Args:
            offer: The offer object
            booking_amount: Original booking amount
            
        Returns:
            Tuple of (discount_amount, final_amount)
        """
        discount_amount = 0.0
        
        if offer.discount_type == "percentage":
            discount_amount = (booking_amount * offer.discount_percentage) / 100
            if offer.max_discount_amount:
                discount_amount = min(discount_amount, offer.max_discount_amount)
        elif offer.discount_type == "fixed":
            discount_amount = min(offer.discount_amount or 0.0, booking_amount)
        
        final_amount = max(0.0, booking_amount - discount_amount)
        return discount_amount, final_amount
    
    @staticmethod
    def use_promo_code(session: Session, promo_code_id: uuid.UUID) -> bool:
        """
        Mark a promo code as used by incrementing its usage count.
        
        Args:
            session: Database session
            promo_code_id: Promo code ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            promo_code = session.get(PromoCode, promo_code_id)
            if promo_code and promo_code.is_valid:
                promo_code.increment_usage()
                session.add(promo_code)
                session.commit()
                return True
            return False
        except SQLAlchemyError:
            session.rollback()
            return False
    
    @staticmethod
    def create_promo_code(
        session: Session,
        code: str,
        offer_id: uuid.UUID,
        max_usage: Optional[int] = None,
        is_active: bool = True
    ) -> Optional[PromoCode]:
        """
        Create a new promo code.
        
        Args:
            session: Database session
            code: Promo code string
            offer_id: Associated offer ID
            max_usage: Maximum usage limit
            is_active: Whether the code is active
            
        Returns:
            Created PromoCode or None if failed
        """
        try:
            promo_code = PromoCode(
                code=code.upper(),
                offer_id=offer_id,
                max_usage=max_usage,
                current_usage=0,
                is_active=is_active
            )
            session.add(promo_code)
            session.commit()
            session.refresh(promo_code)
            return promo_code
        except SQLAlchemyError:
            session.rollback()
            return None
