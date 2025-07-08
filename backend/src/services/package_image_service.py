from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, delete
from typing import List, Optional
import uuid

from ..models.package_image import PackageImage
from ..models.package import Package
from ..schemas.package_image_schemas import (
    PackageImageCreateModel,
    PackageImageUpdateModel,
    PackageImageResponseModel
)


class PackageImageService:
    """Service for managing package images."""
    
    @staticmethod
    async def create_package_image(
        db: AsyncSession,
        package_id: uuid.UUID,
        image_data: PackageImageCreateModel
    ) -> PackageImageResponseModel:
        """Create a new package image."""
        # Verify package exists
        statement = select(Package).where(Package.id == package_id)
        result = await db.exec(statement)
        package = result.first()
        if not package:
            raise ValueError(f"Package with id {package_id} not found")
        
        # If this is marked as primary, unset other primary images
        if image_data.is_primary:
            update_statement = PackageImage.__table__.update().where(
                PackageImage.package_id == package_id
            ).values(is_primary=False)
            await db.execute(update_statement)
        
        # Create new image
        db_image = PackageImage(
            package_id=package_id,
            **image_data.model_dump()
        )
        db.add(db_image)
        await db.commit()
        await db.refresh(db_image)
        
        return PackageImageResponseModel.model_validate(db_image)
    
    @staticmethod
    async def create_multiple_images(
        db: AsyncSession,
        package_id: uuid.UUID,
        images_data: List[PackageImageCreateModel]
    ) -> List[PackageImageResponseModel]:
        """Create multiple images for a package."""
        # Verify package exists
        statement = select(Package).where(Package.id == package_id)
        result = await db.exec(statement)
        package = result.first()
        if not package:
            raise ValueError(f"Package with id {package_id} not found")
        
        # Check if any image is marked as primary
        has_primary = any(img.is_primary for img in images_data)
        if has_primary:
            # Unset existing primary images
            update_statement = PackageImage.__table__.update().where(
                PackageImage.package_id == package_id
            ).values(is_primary=False)
            await db.execute(update_statement)
        
        # Create all images
        db_images = []
        for image_data in images_data:
            db_image = PackageImage(
                package_id=package_id,
                **image_data.model_dump()
            )
            db_images.append(db_image)
            db.add(db_image)
        
        await db.commit()
        
        # Refresh all images
        for db_image in db_images:
            await db.refresh(db_image)
        
        return [PackageImageResponseModel.model_validate(img) for img in db_images]
    
    @staticmethod
    async def get_package_images(
        db: AsyncSession,
        package_id: uuid.UUID
    ) -> List[PackageImageResponseModel]:
        """Get all images for a package."""
        statement = select(PackageImage).where(PackageImage.package_id == package_id).order_by(PackageImage.display_order, PackageImage.created_at)
        result = await db.exec(statement)
        images = result.all()
        return [PackageImageResponseModel.model_validate(img) for img in images]
    
    @staticmethod
    async def update_package_image(
        db: AsyncSession,
        image_id: uuid.UUID,
        image_data: PackageImageUpdateModel
    ) -> Optional[PackageImageResponseModel]:
        """Update a package image."""
        statement = select(PackageImage).where(PackageImage.id == image_id)
        result = await db.exec(statement)
        db_image = result.first()
        
        if not db_image:
            return None
        
        # If setting as primary, unset other primary images for this package
        if image_data.is_primary:
            update_statement = PackageImage.__table__.update().where(
                (PackageImage.package_id == db_image.package_id) &
                (PackageImage.id != image_id)
            ).values(is_primary=False)
            await db.execute(update_statement)
        
        # Update fields
        update_data = image_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_image, field, value)
        
        await db.commit()
        await db.refresh(db_image)
        
        return PackageImageResponseModel.model_validate(db_image)
    
    @staticmethod
    async def delete_package_image(
        db: AsyncSession,
        image_id: uuid.UUID
    ) -> bool:
        """Delete a package image."""
        statement = select(PackageImage).where(PackageImage.id == image_id)
        result = await db.exec(statement)
        db_image = result.first()
        
        if not db_image:
            return False
        
        await db.delete(db_image)
        await db.commit()
        return True
    
    @staticmethod
    async def delete_all_package_images(
        db: AsyncSession,
        package_id: uuid.UUID
    ) -> bool:
        """Delete all images for a package."""
        await db.execute(
            delete(PackageImage).where(PackageImage.package_id == package_id)
        )
        await db.commit()
        return True
    
    @staticmethod
    async def reorder_package_images(
        db: AsyncSession,
        package_id: uuid.UUID,
        image_orders: List[dict]  # [{"id": uuid, "display_order": int}]
    ) -> List[PackageImageResponseModel]:
        """Reorder package images."""
        # Update display orders
        for order_data in image_orders:
            update_statement = PackageImage.__table__.update().where(
                (PackageImage.id == order_data["id"]) &
                (PackageImage.package_id == package_id)
            ).values(display_order=order_data["display_order"])
            await db.execute(update_statement)
        
        await db.commit()
        
        # Return updated images
        return await PackageImageService.get_package_images(db, package_id)


# Create singleton instance
package_image_service = PackageImageService()
