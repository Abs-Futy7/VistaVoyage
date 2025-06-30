from typing import Optional, List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime
import uuid

from ..auth.models import User
from ..auth.schemas import UserUpdateModel


class AdminUserService:
    async def get_users(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        active_only: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Get paginated list of users with filtering"""
        
        # Build the query
        statement = select(User)
        
        # Add filters
        if active_only is not None:
            statement = statement.where(User.is_active == active_only)
        
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (User.full_name.ilike(search_term)) |
                (User.email.ilike(search_term)) |
                (User.city.ilike(search_term)) |
                (User.country.ilike(search_term))
            )
        
        # Get total count
        count_statement = select(func.count(User.uid))
        if statement.whereclause is not None:
            count_statement = count_statement.where(*statement.whereclause.clauses)
        
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        
        # Add pagination and ordering
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(User.created_at.desc())
        
        # Execute query
        result = await session.exec(statement)
        users = result.all()
        
        # Convert to response format
        user_data = []
        for user in users:
            user_data.append({
                "id": str(user.uid),
                "fullName": user.full_name,
                "email": user.email,
                "city": user.city,
                "country": user.country,
                "phone": user.phone,
                "isActive": user.is_active,
                "bookingsCount": user.bookings_count,
                "createdAt": user.created_at.isoformat() + "Z",
                "lastLoginAt": user.last_login_at.isoformat() + "Z" if user.last_login_at else None
            })
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        return {
            "data": user_data,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages
        }
    
    async def get_user_by_id(self, session: AsyncSession, user_id: str) -> Optional[User]:
        """Get a single user by ID"""
        try:
            user_uuid = uuid.UUID(user_id)
            statement = select(User).where(User.uid == user_uuid)
            result = await session.exec(statement)
            return result.first()
        except ValueError:
            return None
    
    async def toggle_user_status(self, session: AsyncSession, user_id: str) -> Optional[Dict[str, Any]]:
        """Toggle the active status of a user"""
        
        user = await self.get_user_by_id(session, user_id)
        if not user:
            return None
        
        user.is_active = not user.is_active
        user.updated_at = datetime.now()
        
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        return {
            "id": str(user.uid),
            "fullName": user.full_name,
            "email": user.email,
            "city": user.city,
            "country": user.country,
            "phone": user.phone,
            "isActive": user.is_active,
            "bookingsCount": user.bookings_count,
            "createdAt": user.created_at.isoformat() + "Z",
            "lastLoginAt": user.last_login_at.isoformat() + "Z" if user.last_login_at else None
        }
    
    async def delete_user(self, session: AsyncSession, user_id: str) -> bool:
        """Delete a user (admin only - be careful!)"""
        
        user = await self.get_user_by_id(session, user_id)
        if not user:
            return False
        
        # Delete from database
        await session.delete(user)
        await session.commit()
        
        return True
    
    async def update_user(
        self,
        session: AsyncSession,
        user_id: str,
        user_data: UserUpdateModel
    ) -> Optional[User]:
        """Update user information (admin)"""
        
        user = await self.get_user_by_id(session, user_id)
        if not user:
            return None
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        # Update timestamp
        user.updated_at = datetime.now()
        
        # Save changes
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        return user


# Create singleton instance
admin_user_service = AdminUserService()
