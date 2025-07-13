"""
Main admin routes module that combines all admin route files
"""
from fastapi import APIRouter
from fastapi.responses import Response

# Import all route modules
from .routes.dashboard import dashboard_router
from .routes.users import users_router
from .routes.blogs import blog_router
from .routes.packages import packages_router
from .routes.bookings import bookings_router
from .routes.destinations import destinations_router
 

# Try to import promo_codes_router with error handling
try:
    from .routes.promo_codes import promo_codes_router
    promo_codes_available = True
except ImportError as e:
    print(f"Warning: Promo codes router not available: {e}")
    promo_codes_router = None
    promo_codes_available = False

# Create the main admin router
admin_router = APIRouter()

# Global OPTIONS handler for CORS preflight requests
@admin_router.options("/{path:path}")
async def admin_options_handler(path: str):
    return Response(status_code=200)

# Include all route modules
admin_router.include_router(dashboard_router, tags=["Dashboard"])
admin_router.include_router(users_router, tags=["Users"])
admin_router.include_router(blog_router, tags=["Blogs"])  
admin_router.include_router(packages_router, tags=["Packages"])
admin_router.include_router(bookings_router, tags=["Bookings"])
admin_router.include_router(destinations_router, tags=["Destinations"])

# Include promo codes router only if available
if promo_codes_available and promo_codes_router:
    admin_router.include_router(promo_codes_router, tags=["Promo Codes"])

# TODO: Add remaining route modules as they are created:
