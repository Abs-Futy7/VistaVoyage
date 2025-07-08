from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from .models import Admin
from .schemas import AdminCreateModel, AdminUpdateModel
from .utils import generate_admin_password_hash, verify_admin_password
from typing import Optional, Dict, Any
import uuid
from datetime import datetime


class AdminService:
    """Service class for admin operations"""
    
    async def admin_exists(self, username: str, session: AsyncSession) -> bool:
        """Check if admin exists by username"""
        statement = select(Admin).where(Admin.username == username)
        result = await session.exec(statement)
        admin = result.first()
        return admin is not None
    
    async def admin_exists_by_email(self, email: str, session: AsyncSession) -> bool:
        """Check if admin exists by email"""
        statement = select(Admin).where(Admin.email == email)
        result = await session.exec(statement)
        admin = result.first()
        return admin is not None
    
    async def create_admin(self, admin_data: AdminCreateModel, session: AsyncSession) -> Admin:
        """Create a new admin"""
        admin_data_dict = admin_data.model_dump()
        
        # Hash password
        admin_data_dict["password_hash"] = generate_admin_password_hash(admin_data_dict.pop("password"))
        
        new_admin = Admin(**admin_data_dict)
        session.add(new_admin)
        await session.commit()
        await session.refresh(new_admin)
        return new_admin
    
    async def get_admin_by_username(self, username: str, session: AsyncSession) -> Optional[Admin]:
        """Get admin by username"""
        statement = select(Admin).where(Admin.username == username)
        result = await session.exec(statement)
        return result.first()
    
    async def get_admin_by_id(self, admin_id: uuid.UUID, session: AsyncSession) -> Optional[Admin]:
        """Get admin by ID"""
        statement = select(Admin).where(Admin.id == admin_id)
        result = await session.exec(statement)
        return result.first()
    
    async def get_all_admins(self, session: AsyncSession, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get paginated list of admins"""
        offset = (page - 1) * limit
        
        # Get total count
        count_stmt = select(Admin)
        count_result = await session.exec(count_stmt)
        total = len(count_result.all())
        
        # Get paginated results
        stmt = select(Admin).offset(offset).limit(limit).order_by(Admin.created_at.desc())
        result = await session.exec(stmt)
        admins = result.all()
        
        return {
            "admins": [
                {
                    "id": str(admin.id),
                    "username": admin.username,
                    "email": admin.email,
                    "full_name": admin.full_name,
                    "role": admin.role,
                    "is_active": admin.is_active,
                    "last_login_at": admin.last_login_at.isoformat() + "Z" if admin.last_login_at else None,
                    "created_at": admin.created_at.isoformat() + "Z"
                }
                for admin in admins
            ],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    
    async def update_admin(self, admin: Admin, admin_data: AdminUpdateModel, session: AsyncSession) -> Admin:
        """Update admin information"""
        update_data = admin_data.model_dump(exclude_unset=True, exclude={"password"})
        
        for field, value in update_data.items():
            setattr(admin, field, value)
        
        admin.updated_at = datetime.now()
        await session.commit()
        await session.refresh(admin)
        return admin
    
    async def change_admin_password(self, admin: Admin, new_password: str, session: AsyncSession) -> Admin:
        """Change admin password"""
        admin.password_hash = generate_admin_password_hash(new_password)
        admin.updated_at = datetime.now()
        await session.commit()
        await session.refresh(admin)
        return admin
    
    async def toggle_admin_status(self, admin_id: uuid.UUID, session: AsyncSession) -> Optional[Admin]:
        """Toggle admin active status"""
        admin = await self.get_admin_by_id(admin_id, session)
        if not admin:
            return None
        
        admin.is_active = not admin.is_active
        admin.updated_at = datetime.now()
        await session.commit()
        await session.refresh(admin)
        return admin
    
    async def delete_admin(self, admin_id: uuid.UUID, session: AsyncSession) -> bool:
        """Delete an admin"""
        admin = await self.get_admin_by_id(admin_id, session)
        if not admin:
            return False
        
        await session.delete(admin)
        await session.commit()
        return True
    
    async def update_last_login(self, admin: Admin, session: AsyncSession) -> Admin:
        """Update admin's last login time"""
        admin.last_login_at = datetime.now()
        await session.commit()
        await session.refresh(admin)
        return admin


# Global instance
admin_service = AdminService()
