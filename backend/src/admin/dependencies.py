from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request, status, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from .utils import decode_admin_token, verify_admin_token
from ..db.redis import is_jti_blocked
from ..db.main import get_session
from .models import Admin
from .service import admin_service
from sqlmodel import select
import uuid


class AdminTokenBearer(HTTPBearer):
    """Admin-specific token bearer for authentication"""
    
    def __init__(self, auto_error=True):
        super().__init__(auto_error=auto_error)
    
    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        creds = await super().__call__(request)
        token = creds.credentials
        
        # Decode token
        token_data = decode_admin_token(token)
        
        if not self.token_valid(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "Invalid admin token",
                    "resolution": "Please login again to obtain a new token"
                }
            )
        
        # Check if token is blocked
        if await is_jti_blocked(token_data.get('jti')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": "Admin token has been revoked",
                    "resolution": "Please login again to obtain a new token"
                }
            )
        
        # Verify it's an admin token
        self.verify_admin_token_data(token_data)
        
        return token_data
    
    def token_valid(self, token: str) -> bool:
        token_data = decode_admin_token(token)
        return token_data is not None
    
    def verify_admin_token_data(self, token_data: dict) -> None:
        # Check if token_data is valid
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token data"
            )
        
        # Check if it's a refresh token (should not be used for access)
        if token_data.get('refresh'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Refresh token used for access",
                    "message": "You are using a refresh token. Please use the access token instead.",
                    "resolution": "Use the 'access_token' field from login response, not 'refresh_token'"
                }
            )
        
        # Check if it's marked as admin token
        if not token_data.get('is_admin'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Non-admin token",
                    "message": "Admin access required",
                    "resolution": "Please login with admin credentials"
                }
            )


class AdminAccessBearer:
    """Dependency that validates admin access and returns admin data"""
    
    async def __call__(
        self, 
        token_data: dict = Depends(AdminTokenBearer()),
        session: AsyncSession = Depends(get_session)
    ) -> dict:
        # Get admin ID from token
        admin_id = token_data.get('admin_id')
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin token: missing admin ID"
            )
        
        # Convert to UUID if it's a string
        try:
            if isinstance(admin_id, str):
                admin_uuid = uuid.UUID(admin_id)
            else:
                admin_uuid = admin_id
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid admin token: invalid admin ID format - {str(e)}"
            )
        
        # Get admin from database
        admin = await admin_service.get_admin_by_id(admin_uuid, session)
        
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin not found"
            )
        
        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is not active"
            )
        
        # Add admin info to token data
        token_data['admin'] = {
            'id': str(admin.id),
            'username': admin.username,
            'email': admin.email,
            'full_name': admin.full_name,
            'role': admin.role
        }
        
        return token_data


# Create instances for dependency injection
admin_token_bearer = AdminTokenBearer()
admin_access_bearer = AdminAccessBearer()
