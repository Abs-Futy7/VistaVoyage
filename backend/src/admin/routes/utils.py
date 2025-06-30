"""
Shared utilities for admin routes
"""
from fastapi import HTTPException
import uuid


def validate_uuid(uuid_string: str, field_name: str = "ID") -> uuid.UUID:
    """Helper function to validate UUID format and return UUID object"""
    try:
        return uuid.UUID(uuid_string)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format")
