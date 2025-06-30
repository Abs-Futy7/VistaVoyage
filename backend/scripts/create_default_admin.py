"""
Script to create the default admin account
Run this after setting up the database migrations
"""
import asyncio
import sys
import os

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.admin.service import admin_service
from src.admin.schemas import AdminCreateModel
from src.config import Config


async def create_default_admin():
    """Create the default admin account if it doesn't exist"""
    try:
        # Get database session
        session_gen = get_session()
        session: AsyncSession = await session_gen.__anext__()
        
        try:
            # Check if default admin already exists
            admin_exists = await admin_service.admin_exists(Config.DEFAULT_ADMIN_USERNAME, session)
            
            if admin_exists:
                print(f"✓ Admin account '{Config.DEFAULT_ADMIN_USERNAME}' already exists")
                return
            
            # Create default admin
            admin_data = AdminCreateModel(
                username=Config.DEFAULT_ADMIN_USERNAME,
                email=Config.DEFAULT_ADMIN_EMAIL,
                password=Config.DEFAULT_ADMIN_PASSWORD,
                full_name=Config.DEFAULT_ADMIN_FULL_NAME,
                role="super_admin"
            )
            
            new_admin = await admin_service.create_admin(admin_data, session)
            
            print("✓ Default admin account created successfully!")
            print(f"  Username: {new_admin.username}")
            print(f"  Email: {new_admin.email}")
            print(f"  Role: {new_admin.role}")
            print(f"  Password: {Config.DEFAULT_ADMIN_PASSWORD}")
            print("\n⚠️  IMPORTANT: Change the default password after first login!")
            print(f"\n🔐 Admin Login URL: POST /api/v1/admin/auth/login")
            print(f"📚 API Documentation: http://localhost:8000/docs")
            
        finally:
            await session.close()
            
    except Exception as e:
        print(f"❌ Error creating default admin: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    print("🚀 Creating default admin account...")
    print("=" * 50)
    asyncio.run(create_default_admin())
    print("=" * 50)
    print("✅ Admin setup complete!")
