from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, Tuple
from ..models.promo_code import PromoCode
from ..models.offer import Offer
from ..schemas.promo_code_schemas import PromoCodeValidationResponseModel
import uuid


class PromoCodeService:
    """Service for handling promo code operations."""
    
    @staticmethod
    def validate_promo_code(
        session: Session,
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
            # Find promo code
            promo_code = None
            if code:
                promo_code = PromoCodeService._get_promo_code_by_string(session, code)
            elif promo_code_id:
                promo_code = PromoCodeService._get_promo_code_by_id(session, promo_code_id)
            else:
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message="No promo code provided",
                    discount_amount=0.0,
                    final_amount=booking_amount
                )
            
            if not promo_code:
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message="Promo code not found",
                    discount_amount=0.0,
                    final_amount=booking_amount
                )
            
            # Check if promo code is valid
            if not promo_code.is_valid:
                reasons = []
                if not promo_code.is_active:
                    reasons.append("inactive")
                if not promo_code.offer.is_valid:
                    reasons.append("offer expired")
                if promo_code.max_usage and promo_code.current_usage >= promo_code.max_usage:
                    reasons.append("usage limit reached")
                
                return PromoCodeValidationResponseModel(
                    is_valid=False,
                    message=f"Promo code is {', '.join(reasons)}",
                    discount_amount=0.0,
                    final_amount=booking_amount,
                    promo_code_id=promo_code.id,
                    offer_title=promo_code.offer.title,
                    remaining_uses=promo_code.remaining_uses
                )
            
            # Calculate discount
            discount_amount, final_amount = PromoCodeService._calculate_discount(
                promo_code.offer, booking_amount
            )
            
            return PromoCodeValidationResponseModel(
                is_valid=True,
                message="Promo code is valid",
                discount_amount=discount_amount,
                discount_percentage=promo_code.offer.discount_percentage,
                final_amount=final_amount,
                promo_code_id=promo_code.id,
                offer_title=promo_code.offer.title,
                remaining_uses=promo_code.remaining_uses
            )
            
        except SQLAlchemyError as e:
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
