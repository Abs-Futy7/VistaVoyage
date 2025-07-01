from fastapi import APIRouter
from .packages import packages_router
from .destinations import destinations_router
from .activities import activities_router
from .offers import offers_router
from .promo_codes import promo_codes_router
from .bookings import booking_router
from .trip_type import trip_type_router



__all__ = [
    "packages_router",
    "destinations_router",
    "activities_router",
    "offers_router",
    "promo_codes_router",
    "booking_router",
    "trip_type_router"
]
