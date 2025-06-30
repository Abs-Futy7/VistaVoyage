"""
Admin utility functions
"""
import uuid
from typing import Optional
from fastapi import HTTPException
import jwt
from datetime import datetime, timedelta, timezone
from src.config import Config
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin JWT Configuration
ADMIN_SECRET_KEY = Config.ADMIN_JWT_SECRET_KEY
ADMIN_ALGORITHM = Config.ADMIN_JWT_ALGORITHM
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = Config.ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES


def generate_admin_password_hash(password: str) -> str:
    """Generate password hash for admin"""
    return pwd_context.hash(password)


def verify_admin_password(password: str, hashed_password: str) -> bool:
    """Verify admin password"""
    return pwd_context.verify(password, hashed_password)


def create_admin_access_token(data: dict, refresh: bool = False, expiry: Optional[timedelta] = None) -> str:
    """
    Create admin access token with admin-specific secret key
    """
    payload = data.copy()
    
    if expiry:
        expire = datetime.now(timezone.utc) + expiry
    else:
        if refresh:
            expire = datetime.now(timezone.utc) + timedelta(days=Config.ADMIN_REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add standard claims
    payload.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "refresh": refresh,
        "is_admin": True,  # Always true for admin tokens
        "jti": str(hash(f"{payload.get('admin_id', '')}_{expire}"))  # JWT ID for blacklisting
    })
    
    return jwt.encode(payload, ADMIN_SECRET_KEY, algorithm=ADMIN_ALGORITHM)


def decode_admin_token(token: str) -> Optional[dict]:
    """
    Decode admin token using admin-specific secret key
    """
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ADMIN_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def verify_admin_token(token: str) -> bool:
    """
    Verify if admin token is valid
    """
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ADMIN_ALGORITHM])
        
        # Check if token is admin token
        if not payload.get("is_admin", False):
            return False
            
        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            return False
            
        return True
    except jwt.PyJWTError:
        return False


def get_admin_token_payload(token: str) -> Optional[dict]:
    """
    Get admin token payload without verification (use with caution)
    """
    try:
        # Decode without verification to get payload
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload if payload.get("is_admin", False) else None
    except jwt.PyJWTError:
        return None


def validate_uuid(uuid_string: str) -> uuid.UUID:
    """
    Validate and convert string to UUID
    
    Args:
        uuid_string: String representation of UUID
        
    Returns:
        UUID object
        
    Raises:
        HTTPException: If UUID is invalid
    """
    try:
        return uuid.UUID(uuid_string)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


def validate_pagination_params(page: int, limit: int) -> tuple[int, int]:
    """
    Validate pagination parameters
    
    Args:
        page: Page number
        limit: Items per page
        
    Returns:
        Tuple of validated (page, limit)
        
    Raises:
        HTTPException: If parameters are invalid
    """
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
    
    return page, limit


def calculate_offset(page: int, limit: int) -> int:
    """
    Calculate offset for pagination
    
    Args:
        page: Page number (1-based)
        limit: Items per page
        
    Returns:
        Offset value for database query
    """
    return (page - 1) * limit


def format_error_response(error: Exception, context: str = "") -> dict:
    """
    Format error response for consistent error handling
    
    Args:
        error: Exception object
        context: Additional context about where error occurred
        
    Returns:
        Formatted error dictionary
    """
    error_msg = str(error)
    if context:
        error_msg = f"{context}: {error_msg}"
    
    return {
        "error": True,
        "message": error_msg,
        "type": type(error).__name__
    }


def validate_date_range(start_date: Optional[str], end_date: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """
    Validate date range parameters
    
    Args:
        start_date: Start date string
        end_date: End date string
        
    Returns:
        Tuple of validated dates
        
    Raises:
        HTTPException: If date format is invalid
    """
    from datetime import datetime
    
    if start_date:
        try:
            datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format.")
    
    if end_date:
        try:
            datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format.")
    
    if start_date and end_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if start >= end:
            raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    return start_date, end_date


def sanitize_search_term(search_term: Optional[str]) -> Optional[str]:
    """
    Sanitize search term for safe database queries
    
    Args:
        search_term: Raw search term
        
    Returns:
        Sanitized search term or None
    """
    if not search_term:
        return None
    
    # Remove extra whitespace and limit length
    sanitized = search_term.strip()[:100]
    
    # Return None if empty after sanitization
    return sanitized if sanitized else None


def build_response_metadata(page: int, limit: int, total_count: int) -> dict:
    """
    Build pagination metadata for API responses
    
    Args:
        page: Current page number
        limit: Items per page
        total_count: Total number of items
        
    Returns:
        Metadata dictionary
    """
    total_pages = (total_count + limit - 1) // limit  # Ceiling division
    
    return {
        "pagination": {
            "current_page": page,
            "per_page": limit,
            "total_items": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }
