"""
Admin routes - now organized into separate modules

This file imports the admin_router from the modular structure.
The old monolithic routes.py has been backed up as routes_backup.py.
"""

# Import the main admin router from the new modular structure
from . import admin_router

# Export for backward compatibility
__all__ = ["admin_router"]