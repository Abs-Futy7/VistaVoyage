from typing import Optional, List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func, delete
from sqlalchemy.orm import selectinload
from datetime import datetime

from ..models.package import Package
from ..models.package_image import PackageImage
from ..schemas.package_schemas import (
    PackageCreateModel, 
    PackageUpdateModel, 
    PackageResponseModel,
    PackageDetailResponseModel
)
from ..schemas.package_details_schemas import PackageDetailsCreateModel
from ..schemas.package_schedule_schemas import PackageScheduleCreateModel
from .package_details_service import package_details_service
from .package_schedule_service import package_schedule_service


class PackageService:
    async def get_packages(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        active_only: bool = False,
        destination_id: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """Get paginated list of packages with filtering"""
        
        # Build the query with relationships
        statement = select(Package).options(
            selectinload(Package.images),
            selectinload(Package.schedule),
            selectinload(Package.details),
            selectinload(Package.destination)
        )
        
        # Add filters
        if active_only:
            statement = statement.where(Package.is_active == True)
        
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (Package.title.ilike(search_term)) |
                (Package.description.ilike(search_term))
            )
        
        if destination_id:
            statement = statement.where(Package.destination_id == destination_id)
        
        # trip_type_id logic removed
        
        if min_price is not None:
            statement = statement.where(Package.price >= min_price)
        
        if max_price is not None:
            statement = statement.where(Package.price <= max_price)
        
        # Get total count
        count_statement = select(func.count(Package.id))
        
        # Apply the same filters to count statement
        if active_only:
            count_statement = count_statement.where(Package.is_active == True)
        
        if search:
            search_term = f"%{search}%"
            count_statement = count_statement.where(
                (Package.title.ilike(search_term)) |
                (Package.description.ilike(search_term))
            )
        
        if destination_id:
            count_statement = count_statement.where(Package.destination_id == destination_id)
        
        # trip_type_id logic removed
        
        if min_price is not None:
            count_statement = count_statement.where(Package.price >= min_price)
        
        if max_price is not None:
            count_statement = count_statement.where(Package.price <= max_price)
        
        total_result = await session.exec(count_statement)
        total = total_result.first() or 0
        
        # Add pagination and ordering
        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit).order_by(Package.created_at.desc())
        
        # Execute query
        result = await session.exec(statement)
        packages = result.all()
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        # Convert to response models
        package_responses = []
        for package in packages:
            package_dict = package.model_dump()
            # Add computed fields for backward compatibility
            if package.schedule:
                package_dict['duration_days'] = package.schedule.duration_days
                package_dict['duration_nights'] = package.schedule.duration_nights
            else:
                # Fallback to main package fields if present
                package_dict['duration_days'] = getattr(package, 'duration_days', None)
                package_dict['duration_nights'] = getattr(package, 'duration_nights', None)
            if package.details:
                package_dict['highlights'] = package.details.highlights
                package_dict['itinerary'] = package.details.itinerary
            if package.images:
                package_dict['image_gallery'] = [img.image_url for img in sorted(package.images, key=lambda x: x.display_order)]
            # Debug log
            print(f"[get_packages] Package {package.id}: duration_days={package_dict['duration_days']}, duration_nights={package_dict['duration_nights']}")
            package_responses.append(PackageResponseModel.model_validate(package_dict))
        
        return {
            "packages": package_responses,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    async def get_package_by_id(self, session: AsyncSession, package_id: str) -> Optional[Package]:
        """Get a single package by ID with all relationships"""
        statement = select(Package).options(
            selectinload(Package.images),
            selectinload(Package.schedule),
            selectinload(Package.details),
            selectinload(Package.destination)
        ).where(Package.id == package_id)
        result = await session.exec(statement)
        return result.first()
    
    async def get_package_detail(self, session: AsyncSession, package_id: str) -> Optional[PackageDetailResponseModel]:
        """Get detailed package information with all related data"""
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return None
        
        # Build detailed response
        package_dict = package.model_dump()
        
        # Add related data
        if package.schedule:
            package_dict['schedule'] = package.schedule.model_dump()
            package_dict['duration_days'] = package.schedule.duration_days
            package_dict['duration_nights'] = package.schedule.duration_nights
        
        if package.details:
            package_dict['details'] = package.details.model_dump()
            package_dict['highlights'] = package.details.highlights
            package_dict['itinerary'] = package.details.itinerary
        
        if package.images:
            package_dict['images'] = [img.model_dump() for img in package.images]
            package_dict['image_gallery'] = [img.image_url for img in sorted(package.images, key=lambda x: x.display_order)]
        
        # Add relationship names
        if package.destination:
            package_dict['destination_name'] = package.destination.name
        # Removed trip_type_name and offer_title from response
        
        return PackageDetailResponseModel.model_validate(package_dict)
    
    async def create_package(
        self,
        session: AsyncSession,
        package_data: PackageCreateModel
    ) -> Package:
        """Create a new package with related schedule and details"""
        
        # Extract normalized data for the main package
        package_dict = package_data.model_dump(exclude={
            'duration_days', 'duration_nights', 'max_group_size', 
            'available_from', 'available_until', 'highlights', 'itinerary', 
            'inclusions', 'exclusions', 'terms_conditions', 'image_gallery'
        })
        
        # Create main package
        new_package = Package(**package_dict)
        session.add(new_package)
        await session.commit()
        await session.refresh(new_package)
        
        # Create schedule with provided data
        schedule_data = PackageScheduleCreateModel(
            package_id=new_package.id,
            duration_days=package_data.duration_days,
            duration_nights=package_data.duration_nights,
            max_group_size=package_data.max_group_size,
            available_from=package_data.available_from,
            available_until=package_data.available_until
        )
        try:
            await package_schedule_service.create_schedule(session, schedule_data)
            print(f"Created schedule for package {new_package.id}")
        except Exception as e:
            print(f"Error creating schedule: {str(e)}")
        
        # Create details with provided data
        details_data = PackageDetailsCreateModel(
            package_id=new_package.id,
            highlights=package_data.highlights,
            itinerary=package_data.itinerary,
            inclusions=package_data.inclusions,
            exclusions=package_data.exclusions,
            terms_conditions=package_data.terms_conditions
        )
        try:
            await package_details_service.create_details(session, details_data)
            print(f"Created details for package {new_package.id}")
        except Exception as e:
            print(f"Error creating details: {str(e)}")
        
        # Create package images if provided
        if package_data.image_gallery:
            from ..services.package_image_service import package_image_service
            from ..schemas.package_image_schemas import PackageImageCreateModel
            
            # Add all gallery images to the package
            for i, image_url in enumerate(package_data.image_gallery):
                image_data = PackageImageCreateModel(
                    image_url=image_url,
                    display_order=i,
                    is_primary=(i == 0)  # Make the first image primary
                )
                try:
                    await package_image_service.create_package_image(
                        session, new_package.id, image_data
                    )
                    print(f"Created image {i} for package {new_package.id}")
                except Exception as e:
                    print(f"Error creating image {i}: {str(e)}")
        
        # Return the refreshed package with all relations and formatted data
        package = await self.get_package_by_id(session, str(new_package.id))
        return await self.get_package_detail(session, str(new_package.id))
    
    async def update_package(
        self,
        session: AsyncSession,
        package_id: str,
        package_data: PackageUpdateModel
    ) -> Optional[Package]:
        """Update an existing package and its related data"""
        
        # Get existing package
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return None
        
        # Update main package fields
        main_package_fields = {
            'title', 'description', 'price', 'destination_id', 'trip_type_id', 
            'offer_id', 'featured_image', 'is_featured', 'is_active'
        }
        
        update_data = package_data.model_dump(exclude_unset=True, exclude_none=True)
        
        for field, value in update_data.items():
            if field in main_package_fields and hasattr(package, field):
                setattr(package, field, value)
        
        package.updated_at = datetime.now()
        session.add(package)
        await session.commit()
        await session.refresh(package)
        
        # Update schedule if schedule data provided
        schedule_fields = {'duration_days', 'duration_nights', 'max_group_size', 'available_from', 'available_until'}
        schedule_updates = {k: v for k, v in update_data.items() if k in schedule_fields}
        
        if schedule_updates:
            from ..schemas.package_schedule_schemas import PackageScheduleUpdateModel
            schedule_update = PackageScheduleUpdateModel(**schedule_updates)
            await package_schedule_service.update_schedule(session, package.id, schedule_update)
        
        # Update details if detail data provided
        detail_fields = {'highlights', 'itinerary', 'inclusions', 'exclusions', 'terms_conditions'}
        detail_updates = {k: v for k, v in update_data.items() if k in detail_fields}
        
        if detail_updates:
            from ..schemas.package_details_schemas import PackageDetailsUpdateModel
            details_update = PackageDetailsUpdateModel(**detail_updates)
            await package_details_service.update_details(session, package.id, details_update)
        
        # Update package images if provided
        if 'image_gallery' in update_data:
            from ..services.package_image_service import package_image_service
            from ..schemas.package_image_schemas import PackageImageCreateModel
            
            # Delete existing images for this package
            await session.execute(delete(PackageImage).where(PackageImage.package_id == package.id))
            await session.commit()
            
            # Add all gallery images to the package
            if update_data.get('image_gallery'):
                for i, image_url in enumerate(update_data['image_gallery']):
                    image_data = PackageImageCreateModel(
                        image_url=image_url,
                        display_order=i,
                        is_primary=(i == 0)  # Make the first image primary
                    )
                    try:
                        await package_image_service.create_package_image(
                            session, package.id, image_data
                        )
                    except Exception as e:
                        print(f"Error creating image {i}: {str(e)}")
        
        # Make sure to fetch the updated package with all relations and return formatted data
        return await self.get_package_detail(session, package_id)
    
    async def delete_package(self, session: AsyncSession, package_id: str) -> bool:
        """Delete a package and its related data (cascaded by foreign keys)"""
        
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return False
        
        # Delete from database (cascades to related tables)
        await session.delete(package)
        await session.commit()
        
        return True
    
    async def toggle_active_status(self, session: AsyncSession, package_id: str) -> Optional[Package]:
        """Toggle the active status of a package"""
        
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return None
        
        package.is_active = not package.is_active
        package.updated_at = datetime.now()
        
        session.add(package)
        await session.commit()
        await session.refresh(package)
        
        return package
    
    async def toggle_featured_status(self, session: AsyncSession, package_id: str) -> Optional[Package]:
        """Toggle the featured status of a package"""
        
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return None
        
        package.is_featured = not package.is_featured
        package.updated_at = datetime.now()
        
        session.add(package)
        await session.commit()
        await session.refresh(package)
        
        return package
    
    async def get_featured_packages(self, session: AsyncSession, limit: int = 6) -> List[Package]:
        """Get featured packages"""
        statement = select(Package).options(
            selectinload(Package.images),
            selectinload(Package.schedule),
            selectinload(Package.destination)
        ).where(
            Package.is_featured == True,
            Package.is_active == True
        ).limit(limit).order_by(Package.created_at.desc())
        
        result = await session.exec(statement)
        return result.all()
    
    async def get_package_stats(self, session: AsyncSession) -> Dict[str, int]:
        """Get package statistics for dashboard"""
        
        total_packages = await session.exec(select(func.count(Package.id)))
        total = total_packages.first() or 0
        
        active_packages = await session.exec(select(func.count(Package.id)).where(Package.is_active == True))
        active = active_packages.first() or 0
        
        featured_packages = await session.exec(select(func.count(Package.id)).where(Package.is_featured == True))
        featured = featured_packages.first() or 0
        
        return {
            "total_packages": total,
            "active_packages": active,
            "inactive_packages": total - active,
            "featured_packages": featured
        }

# Instantiate the service
package_service = PackageService()
