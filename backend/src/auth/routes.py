from fastapi import APIRouter, Depends,status
from src.auth.schemas import UserCreateModel, UserModel , UserLoginModel, UserUpdateModel, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest

from .service import UserService
from src.db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi.exceptions import HTTPException
from .utils import (
    create_access_token, decode_token, verify_password, generate_hash_password,
    generate_otp, store_otp, get_stored_otp, delete_otp,
    store_password_reset_session, verify_password_reset_session, delete_password_reset_session,
    send_otp_email, send_password_reset_confirmation_email
)
from datetime import timedelta , datetime, timezone
from fastapi.responses import JSONResponse
from .dependencies import RefreshTokenBearer,AccessTokenBearer
from src.db.redis import is_jti_blocked, add_jti_to_blocklist
from src.auth.models import User
import uuid
from uuid import UUID 
from sqlmodel import select
import logging
import logging



auth_router = APIRouter()

user_service = UserService()

REFRESH_TOKEN_EXPIRY = 2  # days

# Bearer token authentication 


@auth_router.post(
        '/register',
        response_model=UserModel,
        status_code=status.HTTP_201_CREATED
                
)
async def create_user_account( user_data: UserCreateModel , session: AsyncSession = Depends(get_session)):
     
    email = user_data.email
    user_exists = await user_service.user_exists(email, session)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User with this email already exists."
        )
    
    new_user = await user_service.create_user(user_data, session)
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account."
        )
    return new_user


@auth_router.post('/login')
async def login_user(login_data: UserLoginModel, session: AsyncSession = Depends(get_session)):

    email = login_data.email
    password = login_data.password

    user = await user_service.get_user_by_email(email, session)
    
    if user is not None:
        
        password_valid = verify_password(password, user.password_hash)
        if password_valid:
            user_data = {
                "uid": str(user.uid),
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "passport": user.passport,
                "is_active": user.is_active,
                "bookings_count": user.bookings_count,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
            access_token = create_access_token({"uid": str(user.uid), "email": user.email})
            refresh_token = create_access_token({"uid": str(user.uid), "email": user.email}, refresh=True, expiry=timedelta(days=REFRESH_TOKEN_EXPIRY))
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Login successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": user_data
                }
            )
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )
     
    
@auth_router.get('/refresh_token')
async def  get_new_access_token( 
    token_details: dict = Depends(RefreshTokenBearer()),
    session: AsyncSession = Depends(get_session)):
     
    expiry_timestamp = token_details.get('exp')

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(
            token_details, 
            expiry=timedelta(minutes=15)   
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Access token refreshed successfully",
                "access_token": new_access_token
            }
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token has expired"
    )



@auth_router.get('/health')
async def health_check():
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Server is running"}
    )

@auth_router.post('/logout')
async def logout_user(
    token_details: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session)
):
    jti = token_details.get('jti')
    if not jti:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    if await is_jti_blocked(jti):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token already logged out"
        )
    
    await add_jti_to_blocklist(jti)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logged out successfully"}
    )


@auth_router.get("/profile")
async def get_user_profile(
    token_data: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session)
):
    user_id = token_data.get("id")
    user_uuid = uuid.UUID(user_id)   

    statement = select(User).where(User.uid == UUID(user_id))
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "uid": str(user.uid),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "passport": user.passport,
        "is_active": user.is_active,
        "bookings_count": user.bookings_count,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }


@auth_router.patch("/profile")
async def update_user_profile(
    user_data: UserUpdateModel,
    token_data: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session)
):
    user_id = token_data.get("id")
    user_uuid = uuid.UUID(user_id)   

    statement = select(User).where(User.uid == user_uuid)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await user_service.update_user(user, user_data, session)

    return {
        "message": "Profile updated successfully",
        "user": {
            "uid": str(updated_user.uid),
            "email": updated_user.email,
            "full_name": updated_user.full_name,
            "phone": updated_user.phone,
            "passport": updated_user.passport,
            "is_active": updated_user.is_active,
            "bookings_count": updated_user.bookings_count,
            "created_at": updated_user.created_at.isoformat() if updated_user.created_at else None,
            "updated_at": updated_user.updated_at.isoformat() if updated_user.updated_at else None
        }
    }


# Forgot Password Flow
@auth_router.post('/forgot-password')
async def forgot_password(
    request: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_session)
):
    """Send OTP to user's email for password reset"""
    try:
        # Check if user exists
        user = await user_service.get_user_by_email(request.email, session)
        if not user:
            # For security, don't reveal if email exists or not
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "If this email is registered, you will receive an OTP shortly.",
                    "email": request.email
                }
            )
        
        # Generate and store OTP
        otp = generate_otp()
        await store_otp(request.email, otp)
        
        # Send OTP email
        email_sent = send_otp_email(request.email, otp, user.full_name)
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email. Please try again later."
            )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "OTP sent to your email. Please check your inbox.",
                "email": request.email,
                "expires_in": 300  # 5 minutes
            }
        )
        
    except Exception as e:
        logging.error(f"Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        )


@auth_router.post('/verify-otp')
async def verify_otp(
    request: VerifyOTPRequest,
    session: AsyncSession = Depends(get_session)
):
    """Verify OTP and return session token for password reset"""
    try:
        # Get stored OTP
        stored_otp = await get_stored_otp(request.email)
        
        # Debug logging
        logging.info(f"OTP verification - Email: {request.email}")
        logging.info(f"OTP verification - Provided OTP: '{request.otp}' (type: {type(request.otp)})")
        logging.info(f"OTP verification - Stored OTP: '{stored_otp}' (type: {type(stored_otp)})")
        
        if not stored_otp:
            logging.warning(f"No OTP found for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired or is invalid. Please request a new one."
            )
        
        # Verify OTP - ensure both are strings and strip whitespace
        provided_otp = str(request.otp).strip()
        stored_otp_clean = str(stored_otp).strip()
        
        logging.info(f"OTP comparison - Provided: '{provided_otp}', Stored: '{stored_otp_clean}'")
        
        if provided_otp != stored_otp_clean:
            logging.warning(f"OTP mismatch for {request.email}: provided '{provided_otp}' != stored '{stored_otp_clean}'")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP. Please try again."
            )
        
        # Check if user exists
        user = await user_service.get_user_by_email(request.email, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        
        # Generate session ID for password reset
        session_id = str(uuid.uuid4())
        await store_password_reset_session(request.email, session_id)
        
        # Delete the used OTP
        await delete_otp(request.email)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "OTP verified successfully. You can now reset your password.",
                "session_id": session_id,
                "email": request.email,
                "expires_in": 600  # 10 minutes to reset password
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Verify OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying OTP."
        )


@auth_router.post('/reset-password')
async def reset_password(
    request: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session)
):
    """Reset user password using session ID from OTP verification"""
    try:
        # Verify password reset session
        is_valid = await verify_password_reset_session(request.email, request.session_id)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired session. Please start the password reset process again."
            )
        
        # Get user
        user = await user_service.get_user_by_email(request.email, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        
        # Hash new password
        new_password_hash = generate_hash_password(request.new_password)
        
        # Update user password
        user.password_hash = new_password_hash
        user.updated_at = datetime.now()  # Use timezone-naive datetime for database
        
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # Delete password reset session
        await delete_password_reset_session(request.email)
        
        # Send confirmation email
        send_password_reset_confirmation_email(request.email, user.full_name)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Password reset successfully. You can now login with your new password.",
                "email": request.email
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password."
        )
