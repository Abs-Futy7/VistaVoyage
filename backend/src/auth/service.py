from .models import User
from .schemas import UserCreateModel, UserUpdateModel
from .utils import generate_hash_password
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime



class UserService:
    async def get_user_by_email(self,email: str, session: AsyncSession):
        
        statement = select(User).where(User.email == email)

        result = await session.exec(statement)
        user = result.first()

        return user
    
     
    
    async def user_exists(self,email, session: AsyncSession):
        
        user = await self.get_user_by_email(email, session)
        
        if user:
            return True
        return False
    
    async def create_user(self, user_data: UserCreateModel, session: AsyncSession):
        
        user_data_dict = user_data.model_dump()

 

        new_user = User(**user_data_dict)

        new_user.password_hash = generate_hash_password(user_data_dict['password'])
        session.add(new_user)
        await session.commit()

        return new_user 
    
    async def get_current_user_id(self, user: User):
        
        if not user:
            return None
        return str(user.uid)
    
    async def update_user(self, user: User, user_data: UserUpdateModel, session: AsyncSession):
        """Update user profile with provided data"""
        
        # Get the update data, excluding None values
        update_data = user_data.model_dump(exclude_unset=True, exclude_none=True)
        
        # Update user fields with provided data
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        # Update the timestamp
        user.updated_at = datetime.now()
        
        # Save changes to database
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        return user





