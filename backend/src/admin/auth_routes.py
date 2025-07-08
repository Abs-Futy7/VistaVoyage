from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi.responses import JSONResponse
from datetime import timedelta, datetime, timezone

from .schemas import AdminLoginModel, AdminCreateModel, AdminModel, AdminPasswordChangeModel, AdminUpdateModel, AdminPasswordResetRequestModel, AdminPasswordResetModel
from .service import admin_service
from .dependencies import admin_access_bearer
from .utils import create_admin_access_token, verify_admin_password, send_password_reset_email, verify_password_reset_token
from ..db.main import get_session
from ..db.redis import add_jti_to_blocklist

admin_auth_router = APIRouter()

ADMIN_REFRESH_TOKEN_EXPIRY = 7  # days


@admin_auth_router.post('/login')
async def admin_login(
    login_data: AdminLoginModel, 
    session: AsyncSession = Depends(get_session)
):
    """Admin login endpoint"""
    username = login_data.username
    password = login_data.password

    # Get admin by username
    admin = await admin_service.get_admin_by_username(username, session)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Check if admin account is active
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is not active"
        )
    
    # Verify password
    password_valid = verify_admin_password(password, admin.password_hash)
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Update last login
    await admin_service.update_last_login(admin, session)
    
    # Create tokens with admin-specific payload
    admin_payload = {
        "admin_id": str(admin.id),
        "username": admin.username,
        "email": admin.email,
        "role": admin.role,
        "is_admin": True
    }
    
    access_token = create_admin_access_token(admin_payload)
    refresh_token = create_admin_access_token(
        admin_payload, 
        refresh=True, 
        expiry=timedelta(days=ADMIN_REFRESH_TOKEN_EXPIRY)
    )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Admin login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "admin": {
                "id": str(admin.id),
                "username": admin.username,
                "email": admin.email,
                "full_name": admin.full_name,
                "role": admin.role
            }
        }
    )


@admin_auth_router.post('/create', response_model=AdminModel, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreateModel,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)  # Only existing admins can create new ones
):
    """Create a new admin account"""
    
    # Check if admin with username already exists
    if await admin_service.admin_exists(admin_data.username, session):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this username already exists"
        )
    
    # Check if admin with email already exists
    if await admin_service.admin_exists_by_email(admin_data.email, session):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email already exists"
        )
    
    # Create new admin
    try:
        new_admin = await admin_service.create_admin(admin_data, session)
        return new_admin
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create admin account: {str(e)}"
        )


@admin_auth_router.post('/logout')
async def admin_logout(token_data: dict = Depends(admin_access_bearer)):
    """Admin logout - revoke the current token"""
    jti = token_data.get("jti")
    if jti:
        await add_jti_to_blocklist(jti)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Admin logged out successfully"}
    )


@admin_auth_router.post('/refresh')
async def refresh_admin_token(
    token_data: dict = Depends(admin_access_bearer),
    session: AsyncSession = Depends(get_session)
):
    """Refresh admin access token"""
    admin_id = token_data.get('admin_id')
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Verify admin still exists and is active
    admin = await admin_service.get_admin_by_id(admin_id, session)
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account not found or inactive"
        )
    
    # Create new access token
    admin_payload = {
        "admin_id": str(admin.id),
        "username": admin.username,
        "email": admin.email,
        "role": admin.role,
        "is_admin": True
    }
    
    new_access_token = create_admin_access_token(admin_payload)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Token refreshed successfully",
            "access_token": new_access_token,
            "admin": {
                "id": str(admin.id),
                "username": admin.username,
                "email": admin.email,
                "full_name": admin.full_name,
                "role": admin.role
            }
        }
    )


@admin_auth_router.get('/me', response_model=AdminModel)
async def get_current_admin(
    token_data: dict = Depends(admin_access_bearer),
    session: AsyncSession = Depends(get_session)
):
    """Get current admin information"""
    admin_id = token_data.get('admin_id')
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin information not found in token"
        )
    
    # Get fresh admin data from database
    admin = await admin_service.get_admin_by_id(admin_id, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    return AdminModel(
        id=str(admin.id),
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        role=admin.role,
        is_active=admin.is_active,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )


@admin_auth_router.post('/change-password')
async def change_admin_password(
    password_data: AdminPasswordChangeModel,
    token_data: dict = Depends(admin_access_bearer),
    session: AsyncSession = Depends(get_session)
):
    """Change admin password"""
    admin_id = token_data.get('admin_id')
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin information not found in token"
        )
    
    # Get admin from database
    admin = await admin_service.get_admin_by_id(admin_id, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Verify current password
    if not verify_admin_password(password_data.current_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Change password
    await admin_service.change_admin_password(admin, password_data.new_password, session)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Password changed successfully"}
    )


@admin_auth_router.put('/update-profile', response_model=AdminModel)
async def update_admin_profile(
    update_data: AdminUpdateModel,
    token_data: dict = Depends(admin_access_bearer),
    session: AsyncSession = Depends(get_session)
):
    """Update current admin profile information"""
    admin_id = token_data.get('admin_id')
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin information not found in token"
        )
    admin = await admin_service.get_admin_by_id(admin_id, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    updated_admin = await admin_service.update_admin(admin, update_data, session)
    return AdminModel(
        id=str(updated_admin.id),
        username=updated_admin.username,
        email=updated_admin.email,
        full_name=updated_admin.full_name,
        role=updated_admin.role,
        is_active=updated_admin.is_active,
        created_at=updated_admin.created_at,
        updated_at=updated_admin.updated_at
    )


@admin_auth_router.post('/request-password-reset')
async def request_password_reset(
    data: AdminPasswordResetRequestModel,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    """Request password reset via email (SMTP)"""
    admin = await admin_service.get_admin_by_email(data.email, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin with this email not found"
        )
    # Generate token and send email
    token = await admin_service.generate_password_reset_token(admin)
    background_tasks.add_task(send_password_reset_email, admin.email, token)
    return {"message": "Password reset email sent"}


@admin_auth_router.post('/reset-password')
async def reset_password(
    data: AdminPasswordResetModel,
    session: AsyncSession = Depends(get_session)
):
    """Reset password using token from email"""
    admin_id = verify_password_reset_token(data.token)
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    admin = await admin_service.get_admin_by_id(admin_id, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    await admin_service.change_admin_password(admin, data.new_password, session)
    return {"message": "Password has been reset successfully"}


@admin_auth_router.post('/request-password-reset-otp')
async def request_password_reset_otp(
    data: AdminPasswordResetRequestModel,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    """Request password reset OTP via email (SMTP)"""
    admin = await admin_service.get_admin_by_email(data.email, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin with this email not found"
        )
    # Generate OTP and store it (e.g., in DB or cache)
    otp = await admin_service.generate_and_store_otp(admin)
    background_tasks.add_task(send_password_reset_email, admin.email, otp, is_otp=True)
    return {"message": "Password reset OTP sent to email"}


@admin_auth_router.post('/reset-password-otp')
async def reset_password_with_otp(
    data: AdminPasswordResetModel,  # expects: email, otp, new_password
    session: AsyncSession = Depends(get_session)
):
    """Reset password using OTP sent to email"""
    admin = await admin_service.get_admin_by_email(data.email, session)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin with this email not found"
        )
    # Verify OTP
    valid = await admin_service.verify_otp(admin, data.otp)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    await admin_service.change_admin_password(admin, data.new_password, session)
    return {"message": "Password has been reset successfully"}
