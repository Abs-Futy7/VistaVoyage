from fastapi import APIRouter
# Import all route modules
from .routes.promo_codes import promo_codes_router
from .routes.bookings import booking_router
from .routes.packages import packages_router
from .routes.destinations import destinations_router
from .routes.blogs import blogs_router


user_router = APIRouter()

# Include all route modules
user_router.include_router(promo_codes_router, tags=["Promo Codes"])
user_router.include_router(booking_router, tags=["Bookings"])
user_router.include_router(packages_router, tags=["Packages"])
user_router.include_router(destinations_router, tags=["Destinations"])
user_router.include_router(blogs_router, tags=["Blogs"])
## Removed offers and trip type routers

