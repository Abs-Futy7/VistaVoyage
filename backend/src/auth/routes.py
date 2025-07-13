from fastapi import APIRouter, Depends,status
from src.auth.schemas import UserCreateModel, UserModel , UserLoginModel, UserUpdateModel

from .service import UserService
from src.db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi.exceptions import HTTPException
from .utils import create_access_token, decode_token, verify_password, generate_hash_password
from datetime import timedelta , datetime, timezone
from fastapi.responses import JSONResponse
from .dependencies import RefreshTokenBearer,AccessTokenBearer
from src.db.redis import is_jti_blocked, add_jti_to_blocklist
from src.auth.models import User
import uuid
from uuid import UUID 
from sqlmodel import select



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
