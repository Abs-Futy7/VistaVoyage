from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import Response
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
import uuid as uuid_module
from datetime import datetime

from ...db.main import get_session
from ...services.package_service import package_service
from ...schemas.package_schemas import PackageCreateModel, PackageUpdateModel, PackageListResponseModel
from ..dependencies import admin_access_bearer

packages_router = APIRouter()

# Add OPTIONS handler for CORS preflight requests
@packages_router.options("/packages")
async def packages_options():
    return Response(status_code=200)

@packages_router.options("/packages/{package_id}")
async def package_options(package_id: str):
    return Response(status_code=200)

@packages_router.get("/packages/stats")
async def get_packages_stats(
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get package statistics for admin dashboard"""
    try:
        # Use the existing service method to get some stats
        result = await package_service.get_packages(
            session=session,
            page=1,
            limit=1,  # We only need the totals
            active_only=False
        )
        
        # Get active packages count
        active_result = await package_service.get_packages(
            session=session,
            page=1,
            limit=1,
            active_only=True
        )
        
        # Get featured packages count
        featured_result = await package_service.get_packages(
            session=session,
            page=1,
            limit=1000,  # Get all to count featured
            active_only=False
        )
        
        featured_count = len([p for p in featured_result.packages if p.is_featured])
        
        return {
            "total_packages": result.total,
            "active_packages": active_result.total,
            "inactive_packages": result.total - active_result.total,
            "featured_packages": featured_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.get("/packages", response_model=PackageListResponseModel)
async def get_packages(
    page: int = 1, 
    limit: int = 10, 
    search: Optional[str] = None,
    category: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get paginated list of packages with filtering"""
    try:
        result = await package_service.get_packages(
            session=session,
            page=page,
            limit=limit,
            search=search,
            category=category,
            active_only=False  # Admin can see all packages
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.post("/packages")
async def create_package(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    duration_days: int = Form(...),
    duration_nights: int = Form(...),
    destination_id: str = Form(...),
    trip_type_id: str = Form(...),
    offer_id: Optional[str] = Form(None),
    featured_image: Optional[UploadFile] = File(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Create a new package"""
    try:
        featured_image_url = None
        
        # Handle image upload if provided
        if featured_image and featured_image.filename:
            # Validate file type
            if not featured_image.content_type or not featured_image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            try:
                # Use Supabase service for image upload
                from ...services.supabase_service import supabase_service
                featured_image_url = await supabase_service.upload_package_image(featured_image)
            except Exception as upload_error:
                # Log the error but don't fail the entire operation
                print(f"Image upload failed: {upload_error}")
                featured_image_url = None
        
        # Convert form data to Pydantic model
        package_data = PackageCreateModel(
            title=title,
            description=description,
            price=price,
            duration_days=duration_days,
            duration_nights=duration_nights,
            destination_id=uuid_module.UUID(destination_id),
            trip_type_id=uuid_module.UUID(trip_type_id),
            offer_id=uuid_module.UUID(offer_id) if offer_id else None,
            featured_image=featured_image_url,
            is_featured=is_featured,
            is_active=is_active
        )
        
        new_package = await package_service.create_package(session, package_data)
        return new_package
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid UUID format: {str(ve)}")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.put("/packages/{package_id}")
async def update_package(
    package_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    duration_days: Optional[int] = Form(None),
    duration_nights: Optional[int] = Form(None),
    destination_id: Optional[str] = Form(None),
    trip_type_id: Optional[str] = Form(None),
    offer_id: Optional[str] = Form(None),
    featured_image: Optional[UploadFile] = File(None),
    is_featured: Optional[bool] = Form(None),
    is_active: Optional[bool] = Form(None),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Update an existing package"""
    try:
        # Get existing package to check if it exists and get current featured_image
        existing_package = await package_service.get_package_by_id(session, package_id)
        if not existing_package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        featured_image_url = existing_package.featured_image  # Keep existing image by default
        
        # Handle image upload if provided
        if featured_image and featured_image.filename:
            # Validate file type
            if not featured_image.content_type or not featured_image.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            try:
                # Use Supabase service for image upload
                from ...services.supabase_service import supabase_service
                featured_image_url = await supabase_service.upload_package_image(featured_image)
            except Exception as upload_error:
                # Log the error but don't fail the entire operation
                print(f"Image upload failed: {upload_error}")
                featured_image_url = existing_package.featured_image  # Keep existing
        
        # Build update data dictionary, only including provided fields
        update_data = PackageUpdateModel()
        if title is not None:
            update_data.title = title
        if description is not None:
            update_data.description = description
        if price is not None:
            update_data.price = price
        if duration_days is not None:
            update_data.duration_days = duration_days
        if duration_nights is not None:
            update_data.duration_nights = duration_nights
        if destination_id is not None:
            update_data.destination_id = uuid_module.UUID(destination_id)
        if trip_type_id is not None:
            update_data.trip_type_id = uuid_module.UUID(trip_type_id)
        if offer_id is not None:
            update_data.offer_id = uuid_module.UUID(offer_id) if offer_id else None
        if featured_image is not None:  # This covers both file upload and clearing the image
            update_data.featured_image = featured_image_url
        if is_featured is not None:
            update_data.is_featured = is_featured
        if is_active is not None:
            update_data.is_active = is_active
        
        updated_package = await package_service.update_package(
            session=session,
            package_id=package_id,
            package_data=update_data
        )
        if not updated_package:
            raise HTTPException(status_code=404, detail="Package not found")
        return updated_package
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid UUID format: {str(ve)}")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.patch("/packages/{package_id}/toggle-active")
async def toggle_package_active_status(
    package_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Toggle the active status of a package"""
    try:
        package = await package_service.toggle_active_status(session, package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        return {
            "message": f"Package {'activated' if package.is_active else 'deactivated'} successfully",
            "is_active": package.is_active
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.delete("/packages/{package_id}")
async def delete_package(
    package_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Delete a package"""
    try:
        success = await package_service.delete_package(session, package_id)
        if not success:
            raise HTTPException(status_code=404, detail="Package not found")
        return {"message": "Package deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.post("/packages/upload-image")
async def upload_package_image(
    image: UploadFile = File(...),
    token_data: dict = Depends(admin_access_bearer)
):
    """Upload a package image to Supabase storage (standalone endpoint)"""
    try:
        from ...services.supabase_service import supabase_service
        image_url = await supabase_service.upload_package_image(image)
        return {"image_url": image_url}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.get("/packages/{package_id}")
async def get_package(
    package_id: str,
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get a single package by ID"""
    try:
        package = await package_service.get_package_by_id(session, package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        return package
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@packages_router.post("/packages/{package_id}/upload-image")
async def upload_package_image_to_existing(
    package_id: str,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Upload featured image for an existing package"""
    try:
        # Check if package exists
        existing_package = await package_service.get_package_by_id(session, package_id)
        if not existing_package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        try:
            # Use Supabase service for image upload
            from ...services.supabase_service import supabase_service
            image_url = await supabase_service.upload_package_image(file)
        except Exception as upload_error:
            print(f"Image upload failed: {upload_error}")
            raise HTTPException(status_code=500, detail="Failed to upload image")
        
        # Update package with new image URL
        package_data = PackageUpdateModel(featured_image=image_url)
        updated_package = await package_service.update_package(
            session=session,
            package_id=package_id,
            package_data=package_data
        )
        
        return {"image_url": image_url}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))