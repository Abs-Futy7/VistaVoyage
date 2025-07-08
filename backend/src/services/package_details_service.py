"""
Service for package details operations
"""
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
import uuid

from ..models.package_details import PackageDetails
from ..models.package import Package
from ..schemas.package_details_schemas import (
    PackageDetailsCreateModel,
    PackageDetailsUpdateModel
)


class PackageDetailsService:
    """Service class for package details operations"""

    async def create_details(
        self,
        session: AsyncSession,
        details_data: PackageDetailsCreateModel
    ) -> PackageDetails:
        """Create package details"""
        
        # Verify package exists
        package_statement = select(Package).where(Package.id == details_data.package_id)
        package_result = await session.exec(package_statement)
        package = package_result.first()
        
        if not package:
            raise ValueError("Package not found")
        
        # Check if details already exist for this package
        existing_statement = select(PackageDetails).where(
            PackageDetails.package_id == details_data.package_id
        )
        existing_result = await session.exec(existing_statement)
        existing_details = existing_result.first()
        
        if existing_details:
            raise ValueError("Details already exist for this package")
        
        # Create new details
        details = PackageDetails(
            package_id=details_data.package_id,
            highlights=details_data.highlights,
            itinerary=details_data.itinerary,
            inclusions=details_data.inclusions,
            exclusions=details_data.exclusions,
            terms_conditions=details_data.terms_conditions
        )
        
        session.add(details)
        await session.commit()
        await session.refresh(details)
        
        return details

    async def get_details_by_package_id(
        self,
        session: AsyncSession,
        package_id: uuid.UUID
    ) -> Optional[PackageDetails]:
        """Get package details by package ID"""
        statement = select(PackageDetails).where(PackageDetails.package_id == package_id)
        result = await session.exec(statement)
        return result.first()

    async def update_details(
        self,
        session: AsyncSession,
        package_id: uuid.UUID,
        details_data: PackageDetailsUpdateModel
    ) -> Optional[PackageDetails]:
        """Update package details"""
        statement = select(PackageDetails).where(PackageDetails.package_id == package_id)
        result = await session.exec(statement)
        details = result.first()
        
        # If details don't exist, create them
        if not details:
            # First, verify package exists
            package_statement = select(Package).where(Package.id == package_id)
            package_result = await session.exec(package_statement)
            package = package_result.first()
            
            if not package:
                return None
                
            # Create new details record
            from ..schemas.package_details_schemas import PackageDetailsCreateModel
            create_data = PackageDetailsCreateModel(
                package_id=package_id,
                highlights=details_data.highlights,
                itinerary=details_data.itinerary,
                inclusions=details_data.inclusions,
                exclusions=details_data.exclusions,
                terms_conditions=details_data.terms_conditions
            )
            return await self.create_details(session, create_data)
        
        # Update fields if provided
        if details_data.highlights is not None:
            details.highlights = details_data.highlights
        if details_data.itinerary is not None:
            details.itinerary = details_data.itinerary
        if details_data.inclusions is not None:
            details.inclusions = details_data.inclusions
        if details_data.exclusions is not None:
            details.exclusions = details_data.exclusions
        if details_data.terms_conditions is not None:
            details.terms_conditions = details_data.terms_conditions
        
        await session.commit()
        await session.refresh(details)
        
        return details

    async def delete_details(
        self,
        session: AsyncSession,
        package_id: uuid.UUID
    ) -> bool:
        """Delete package details"""
        statement = select(PackageDetails).where(PackageDetails.package_id == package_id)
        result = await session.exec(statement)
        details = result.first()
        
        if not details:
            return False
        
        await session.delete(details)
        await session.commit()
        
        return True


# Create service instance
package_details_service = PackageDetailsService()
