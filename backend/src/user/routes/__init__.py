from fastapi import APIRouter
from .packages import packages_router
from .destinations import destinations_router
from .promo_codes import promo_codes_router
from .bookings import booking_router
from .blogs import blogs_router



__all__ = [
    "packages_router",
    "destinations_router",
    "promo_codes_router",
    "booking_router",
    "blogs_router"
]
