"""
Service for combined package details and schedule operations
"""
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
import uuid

from ..models.package_detail_schedule import PackageDetailSchedule
from ..models.package import Package
from ..schemas.package_detail_schedule_schemas import (
    PackageDetailScheduleCreateModel,
    PackageDetailScheduleUpdateModel
)

class PackageDetailScheduleService:
    """Service class for combined package details and schedule operations"""

    async def create_detail_schedule(
        self,
        session: AsyncSession,
        data: PackageDetailScheduleCreateModel
    ) -> PackageDetailSchedule:
        # Verify package exists
        package_statement = select(Package).where(Package.id == data.package_id)
        package_result = await session.exec(package_statement)
        package = package_result.first()
        if not package:
            raise ValueError("Package not found")
        # Check if already exists
        existing_statement = select(PackageDetailSchedule).where(PackageDetailSchedule.package_id == data.package_id)
        existing_result = await session.exec(existing_statement)
        existing = existing_result.first()
        if existing:
            raise ValueError("Detail/schedule already exists for this package")
        # Create new
        detail_schedule = PackageDetailSchedule(**data.dict())
        session.add(detail_schedule)
        await session.commit()
        await session.refresh(detail_schedule)
        return detail_schedule

    async def get_by_package_id(self, session: AsyncSession, package_id: uuid.UUID) -> Optional[PackageDetailSchedule]:
        statement = select(PackageDetailSchedule).where(PackageDetailSchedule.package_id == package_id)
        result = await session.exec(statement)
        return result.first()

    async def update_detail_schedule(
        self,
        session: AsyncSession,
        package_id: uuid.UUID,
        update_data: PackageDetailScheduleUpdateModel
    ) -> Optional[PackageDetailSchedule]:
        statement = select(PackageDetailSchedule).where(PackageDetailSchedule.package_id == package_id)
        result = await session.exec(statement)
        detail_schedule = result.first()
        if not detail_schedule:
            return None
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(detail_schedule, field, value)
        await session.commit()
        await session.refresh(detail_schedule)
        return detail_schedule

    async def delete_by_package_id(self, session: AsyncSession, package_id: uuid.UUID) -> bool:
        statement = select(PackageDetailSchedule).where(PackageDetailSchedule.package_id == package_id)
        result = await session.exec(statement)
        detail_schedule = result.first()
        if not detail_schedule:
            return False
        await session.delete(detail_schedule)
        await session.commit()
        return True

package_detail_schedule_service = PackageDetailScheduleService()
