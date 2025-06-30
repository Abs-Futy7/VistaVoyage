from typing import Optional, List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime
import uuid

from ..models.package import Package
from ..schemas.package_schemas import PackageCreateModel, PackageUpdateModel, PackageResponseModel


class PackageService:
    async def get_packages(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        category: Optional[str] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        """Get paginated list of packages with filtering"""
        
        # Build the query
        statement = select(Package)
        
        # Add filters
        if active_only:
            statement = statement.where(Package.is_active == True)
        
        if category:
            statement = statement.where(Package.category == category)
        
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (Package.title.ilike(search_term)) |
                (Package.description.ilike(search_term)) |
                (Package.location.ilike(search_term))
            )
        
        # Get total count
        count_statement = select(func.count(Package.id))
        if statement.whereclause is not None:
            count_statement = count_statement.where(*statement.whereclause.clauses)
        
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
        
        return {
            "data": [PackageResponseModel.model_validate(package) for package in packages],
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages
        }
    
    async def get_package_by_id(self, session: AsyncSession, package_id: str) -> Optional[Package]:
        """Get a single package by ID"""
        statement = select(Package).where(Package.id == package_id)
        result = await session.exec(statement)
        return result.first()
    
    async def create_package(
        self,
        session: AsyncSession,
        package_data: PackageCreateModel
    ) -> Package:
        """Create a new package"""
        
        # Generate package ID
        package_id = f"PKG-{uuid.uuid4().hex[:6].upper()}"
        
        # Create package object
        package_dict = package_data.model_dump()
        package_dict["id"] = package_id
        
        new_package = Package(**package_dict)
        
        # Save to database
        session.add(new_package)
        await session.commit()
        await session.refresh(new_package)
        
        return new_package
    
    async def update_package(
        self,
        session: AsyncSession,
        package_id: str,
        package_data: PackageUpdateModel
    ) -> Optional[Package]:
        """Update an existing package"""
        
        # Get existing package
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return None
        
        # Update fields
        update_data = package_data.model_dump(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            if hasattr(package, field):
                setattr(package, field, value)
        
        # Update timestamp
        package.updated_at = datetime.now()
        
        # Save changes
        session.add(package)
        await session.commit()
        await session.refresh(package)
        
        return package
    
    async def delete_package(self, session: AsyncSession, package_id: str) -> bool:
        """Delete a package"""
        
        package = await self.get_package_by_id(session, package_id)
        if not package:
            return False
        
        # Delete from database
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


# Create singleton instance
package_service = PackageService()
