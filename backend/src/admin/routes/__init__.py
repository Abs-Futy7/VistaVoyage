"""
Admin routes package initialization
"""

# Import all routers to make them available when importing from this package
from .dashboard import dashboard_router
from .users import users_router
from .blogs import blog_router
from .packages import packages_router
from .bookings import bookings_router
from .trip_types import trip_types_router
from .destinations import destinations_router
from .activities import activities_router
from .offers import offers_router

# Only import promo_codes if it exists and is properly configured
try:
    from .promo_codes import promo_codes_router
except ImportError as e:
    print(f"Warning: Could not import promo_codes_router: {e}")
    promo_codes_router = None

__all__ = [
    "dashboard_router",
    "users_router", 
    "blog_router",
    "packages_router",
    "bookings_router",
    "trip_types_router",
    "destinations_router",
    "activities_router",
    "offers_router",
    "promo_codes_router"
]