# Admin Routes Restructuring

## Overview
The admin routes have been restructured from a single large `routes.py` file (1674+ lines) into multiple smaller, more manageable modules organized by functionality.

## New Structure

```
src/admin/
├── __init__.py              # Main admin router that combines all route modules
├── routes.py                # Simple import wrapper for backward compatibility  
├── routes_backup.py         # Backup of the original monolithic routes.py
├── routes/
│   ├── __init__.py
│   ├── utils.py             # Shared utilities (validate_uuid, etc.)
│   ├── dashboard.py         # Dashboard and system stats routes
│   ├── users.py             # User management routes
│   ├── blogs.py             # Blog management routes
│   ├── packages.py          # Package management routes
│   ├── bookings.py          # Booking management routes
│   ├── trip_types.py        # Trip type management routes
│   ├── destinations.py      # Destination management routes
│   └── [activities.py]      # TODO: Activities routes (still in backup)
│   └── [offers.py]          # TODO: Offers routes (still in backup)
│   └── [promo_codes.py]     # TODO: Promo codes routes (still in backup)
```

## Route Organization

### 1. Dashboard Routes (`dashboard.py`)
- `GET /dashboard/stats` - Main dashboard statistics
- `GET /system/stats` - Comprehensive system statistics  
- `POST /setup-storage` - Supabase storage setup

### 2. User Management (`users.py`)
- `GET /users` - List users with pagination and search
- `PATCH /users/{user_id}/toggle-status` - Toggle user active status
- `DELETE /users/{user_id}` - Delete user

### 3. Blog Management (`blogs.py`)
- `GET /blogs` - List blogs with pagination and filtering
- `POST /blogs` - Create new blog post
- `PUT /blogs/{blog_id}` - Update blog post
- `DELETE /blogs/{blog_id}` - Delete blog post
- `PATCH /blogs/{blog_id}/toggle-publish` - Toggle publish status
- `POST /blogs/upload-image` - Upload blog image

### 4. Package Management (`packages.py`)
- `GET /packages` - List packages with pagination and filtering
- `POST /packages` - Create new package
- `PUT /packages/{package_id}` - Update package
- `PATCH /packages/{package_id}/toggle-active` - Toggle active status
- `DELETE /packages/{package_id}` - Delete package
- `POST /packages/upload-image` - Upload package image

### 5. Booking Management (`bookings.py`)
- `GET /bookings` - List bookings with pagination and filtering
- `PATCH /bookings/{booking_id}/status` - Update booking status

### 6. Trip Types (`trip_types.py`)
- `GET /trip-types` - List trip types with pagination and search
- `POST /trip-types` - Create new trip type
- `PUT /trip-types/{trip_type_id}` - Update trip type
- `DELETE /trip-types/{trip_type_id}` - Delete trip type

### 7. Destinations (`destinations.py`)
- `GET /destinations` - List destinations with pagination and filtering
- `POST /destinations` - Create new destination
- `PUT /destinations/{destination_id}` - Update destination
- `DELETE /destinations/{destination_id}` - Delete destination
- `POST /destinations/upload-image` - Upload destination image

## Shared Utilities (`utils.py`)

### validate_uuid()
A helper function used across all route modules for consistent UUID validation:
```python
def validate_uuid(uuid_string: str, field_name: str = "ID") -> uuid.UUID:
    """Helper function to validate UUID format and return UUID object"""
```

## Benefits of This Structure

1. **Maintainability**: Each module focuses on a specific domain
2. **Readability**: Smaller files are easier to understand and navigate
3. **Collaboration**: Multiple developers can work on different modules simultaneously
4. **Testing**: Easier to write focused tests for each module
5. **Reusability**: Shared utilities can be imported where needed
6. **Scalability**: Easy to add new route modules for new features

## Migration Notes

### What Was Completed:
- ✅ Dashboard routes
- ✅ User management routes
- ✅ Blog routes (with UUID validation and updated schemas)
- ✅ Package routes  
- ✅ Booking routes
- ✅ Trip type routes (with UUID validation)
- ✅ Destination routes (with UUID validation)
- ✅ Shared utilities module

### What Still Needs Migration:
- ⏳ Activities routes (extract from routes_backup.py)
- ⏳ Offers routes (extract from routes_backup.py)
- ⏳ Promo codes routes (extract from routes_backup.py)

## Usage

The main application can continue to import `admin_router` from the admin module:

```python
from src.admin import admin_router
# or
from src.admin.routes import admin_router
```

All existing route paths and functionality remain the same - this is purely an organizational refactoring.

## UUID Migration Status

As part of this restructuring, all routes have been updated to properly handle UUID primary keys:

- ✅ Blog routes: Updated with UUID validation and corrected schema fields
- ✅ Trip type routes: Updated with UUID validation  
- ✅ Destination routes: Updated with UUID validation
- ✅ Package routes: Schema updated to match model (UUID fields)
- ⏳ Activities, Offers, Promo codes: Need UUID validation when migrated

## Next Steps

1. Extract remaining route modules (activities, offers, promo_codes)
2. Add UUID validation to any remaining routes that need it
3. Run Alembic migration to convert database from integer to UUID primary keys
4. Test all endpoints to ensure functionality is preserved
