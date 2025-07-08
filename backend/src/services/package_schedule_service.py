"""
Service for package schedule operations
"""
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
import uuid
from datetime import datetime

from ..models.package_schedule import PackageSchedule
from ..models.package import Package
from ..schemas.package_schedule_schemas import (
    PackageScheduleCreateModel,
    PackageScheduleUpdateModel,
    ScheduleSummaryModel
)


class PackageScheduleService:
    """Service class for package schedule operations"""

    async def create_schedule(
        self,
        session: AsyncSession,
        schedule_data: PackageScheduleCreateModel
    ) -> PackageSchedule:
        """Create package schedule"""
        
        # Verify package exists
        package_statement = select(Package).where(Package.id == schedule_data.package_id)
        package_result = await session.exec(package_statement)
        package = package_result.first()
        
        if not package:
            raise ValueError("Package not found")
        
        # Check if schedule already exists for this package
        existing_statement = select(PackageSchedule).where(
            PackageSchedule.package_id == schedule_data.package_id
        )
        existing_result = await session.exec(existing_statement)
        existing_schedule = existing_result.first()
        
        if existing_schedule:
            raise ValueError("Schedule already exists for this package")
        
        # Create new schedule
        schedule = PackageSchedule(
            package_id=schedule_data.package_id,
            duration_days=schedule_data.duration_days,
            duration_nights=schedule_data.duration_nights,
            max_group_size=schedule_data.max_group_size,
            available_from=schedule_data.available_from,
            available_until=schedule_data.available_until
        )
        
        session.add(schedule)
        await session.commit()
        await session.refresh(schedule)
        
        return schedule

    async def get_schedule_by_package_id(
        self,
        session: AsyncSession,
        package_id: uuid.UUID
    ) -> Optional[PackageSchedule]:
        """Get package schedule by package ID"""
        statement = select(PackageSchedule).where(PackageSchedule.package_id == package_id)
        result = await session.exec(statement)
        return result.first()

    async def update_schedule(
        self,
        session: AsyncSession,
        package_id: uuid.UUID,
        schedule_data: PackageScheduleUpdateModel
    ) -> Optional[PackageSchedule]:
        """Update package schedule"""
        statement = select(PackageSchedule).where(PackageSchedule.package_id == package_id)
        result = await session.exec(statement)
        schedule = result.first()
        
        # If schedule doesn't exist, create it
        if not schedule:
            # First, verify package exists
            package_statement = select(Package).where(Package.id == package_id)
            package_result = await session.exec(package_statement)
            package = package_result.first()
            
            if not package:
                return None
                
            # Create new schedule record
            from ..schemas.package_schedule_schemas import PackageScheduleCreateModel
            
            # Extract non-None values from update model
            create_data_dict = {k: v for k, v in schedule_data.model_dump().items() if v is not None}
            
            # Add package_id which is required
            create_data_dict["package_id"] = package_id
            
            # Create model with proper defaults for required fields
            if "duration_days" not in create_data_dict:
                create_data_dict["duration_days"] = 1  # Default to 1 day
            if "duration_nights" not in create_data_dict:
                create_data_dict["duration_nights"] = 0  # Default to 0 nights
                
            create_data = PackageScheduleCreateModel(**create_data_dict)
            return await self.create_schedule(session, create_data)
        
        # Update fields if provided
        if schedule_data.duration_days is not None:
            schedule.duration_days = schedule_data.duration_days
        if schedule_data.duration_nights is not None:
            schedule.duration_nights = schedule_data.duration_nights
        if schedule_data.max_group_size is not None:
            schedule.max_group_size = schedule_data.max_group_size
        if schedule_data.available_from is not None:
            schedule.available_from = schedule_data.available_from
        if schedule_data.available_until is not None:
            schedule.available_until = schedule_data.available_until
        
        await session.commit()
        await session.refresh(schedule)
        
        return schedule

    async def delete_schedule(
        self,
        session: AsyncSession,
        package_id: uuid.UUID
    ) -> bool:
        """Delete package schedule"""
        statement = select(PackageSchedule).where(PackageSchedule.package_id == package_id)
        result = await session.exec(statement)
        schedule = result.first()
        
        if not schedule:
            return False
        
        await session.delete(schedule)
        await session.commit()
        
        return True

    async def get_schedule_summary(
        self,
        session: AsyncSession,
        package_id: uuid.UUID
    ) -> Optional[ScheduleSummaryModel]:
        """Get schedule summary for a package"""
        schedule = await self.get_schedule_by_package_id(session, package_id)
        
        if not schedule:
            return None
        
        # Check availability
        now = datetime.now()
        is_available = True
        
        if schedule.available_from and schedule.available_from > now:
            is_available = False
        if schedule.available_until and schedule.available_until < now:
            is_available = False
        
        return ScheduleSummaryModel(
            duration_days=schedule.duration_days,
            duration_nights=schedule.duration_nights,
            max_group_size=schedule.max_group_size,
            is_available=is_available
        )


# Create service instance
package_schedule_service = PackageScheduleService()
