from fastapi import APIRouter
# Import all route modules
from .routes.activities import activities_router
from .routes.offers import offers_router
from .routes.promo_codes import promo_codes_router
from .routes.bookings import booking_router
from .routes.packages import packages_router
from .routes.destinations import destinations_router
from .routes.trip_type import trip_type_router

user_router = APIRouter()

# Include all route modules
user_router.include_router(activities_router, tags=["Activities"])
user_router.include_router(offers_router, tags=["Offers"])
user_router.include_router(promo_codes_router, tags=["Promo Codes"])
user_router.include_router(booking_router, tags=["Bookings"])
user_router.include_router(packages_router, tags=["Packages"])
user_router.include_router(destinations_router, tags=["Destinations"])
user_router.include_router(trip_type_router, tags=["Trip Types"])

