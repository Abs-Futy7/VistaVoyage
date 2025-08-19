from typing import Optional, Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from fastapi import HTTPException, UploadFile
from ..models.destination import Destination
from ..schemas.destination_schemas import DestinationResponseModel, DestinationCreateModel, DestinationUpdateModel
from .supabase_service import supabase_service
import uuid


class DestinationService:
    async def get_destinations(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        country: Optional[str] = None,
        is_active: Optional[bool] = None,
        active_only: bool = False
    ) -> Dict[str, Any]:
        """Get paginated list of destinations with advanced filtering"""
        query = select(Destination)
        
        # Apply filters
        if active_only or is_active is True:
            query = query.where(Destination.is_active == True)
        elif is_active is False:
            query = query.where(Destination.is_active == False)
            
        if search:
            search_term = f"%{search}%"
            query = query.where(
                Destination.name.ilike(search_term) |
                Destination.country.ilike(search_term) |
                Destination.description.ilike(search_term)
            )
            
        if country:
            query = query.where(Destination.country.ilike(f"%{country}%"))
        
        # Get total count with same filters
        count_query = select(func.count(Destination.id))
        if active_only or is_active is True:
            count_query = count_query.where(Destination.is_active == True)
        elif is_active is False:
            count_query = count_query.where(Destination.is_active == False)
        if search:
            search_term = f"%{search}%"
            count_query = count_query.where(
                Destination.name.ilike(search_term) |
                Destination.country.ilike(search_term) |
                Destination.description.ilike(search_term)
            )
        if country:
            count_query = count_query.where(Destination.country.ilike(f"%{country}%"))
            
        total_result = await session.exec(count_query)
        total = total_result.first() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Destination.name.asc())
        
        result = await session.exec(query)
        destinations = result.all()
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "destinations": [DestinationResponseModel.model_validate(dest) for dest in destinations],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    async def get_destination_stats(self, session: AsyncSession) -> Dict[str, Any]:
        """Get destination statistics for admin dashboard"""
        # Total destinations
        total_query = select(func.count(Destination.id))
        total_result = await session.exec(total_query)
        total_destinations = total_result.one()
        
        # Active destinations
        active_query = select(func.count(Destination.id)).where(Destination.is_active == True)
        active_result = await session.exec(active_query)
        active_destinations = active_result.one()
        
        # Destinations by country
        country_query = select(Destination.country, func.count(Destination.id)).group_by(Destination.country)
        country_result = await session.exec(country_query)
        destinations_by_country = {country: count for country, count in country_result.all() if country}
        
        return {
            "total_destinations": total_destinations,
            "active_destinations": active_destinations,
            "inactive_destinations": total_destinations - active_destinations,
            "destinations_by_country": destinations_by_country
        }

    async def get_destination_by_id(self, session: AsyncSession, destination_id: str) -> Optional[DestinationResponseModel]:
        """Get a specific destination by ID"""
        try:
            destination_uuid = uuid.UUID(destination_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid destination ID format")
            
        query = select(Destination).where(Destination.id == destination_uuid)
        result = await session.exec(query)
        destination = result.first()
        
        if not destination:
            return None
            
        return DestinationResponseModel.model_validate(destination)

    async def create_destination(
        self,
        session: AsyncSession,
        destination_data: DestinationCreateModel,
        featured_image: Optional[UploadFile] = None,
        image_gallery: Optional[List[UploadFile]] = None,
        admin_id: Optional[str] = None
    ) -> DestinationResponseModel:
        """Create a new destination, recording the admin who created it."""
        try:
            # Handle featured image upload if provided
            featured_image_url = None
            if featured_image:
                featured_image_url = await supabase_service.upload_destination_image(featured_image)

            # Handle image gallery upload if provided
            image_gallery_urls = []
            if image_gallery:
                for image in image_gallery:
                    image_url = await supabase_service.upload_destination_image(image)
                    image_gallery_urls.append(image_url)

            destination_kwargs = destination_data.model_dump(exclude_unset=True)
            if admin_id:
                destination_kwargs['created_by'] = admin_id

            destination = Destination(
                **destination_kwargs,
                featured_image=featured_image_url,
                image_gallery=image_gallery_urls if image_gallery_urls else None
            )

            session.add(destination)
            await session.commit()
            await session.refresh(destination)

            return DestinationResponseModel.model_validate(destination)

        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating destination: {str(e)}")

    async def update_destination(
        self, 
        session: AsyncSession, 
        destination_id: str, 
        destination_data: DestinationUpdateModel,
        featured_image: Optional[UploadFile] = None,
        image_gallery: Optional[List[UploadFile]] = None
    ) -> Optional[DestinationResponseModel]:
        """Update an existing destination"""
        try:
            destination_uuid = uuid.UUID(destination_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid destination ID format")
            
        query = select(Destination).where(Destination.id == destination_uuid)
        result = await session.exec(query)
        destination = result.first()
        
        if not destination:
            return None
        
        try:
            # Handle featured image upload if provided
            if featured_image:
                featured_image_url = await supabase_service.upload_destination_image(featured_image)
                destination.featured_image = featured_image_url
            
            # Handle image gallery upload if provided
            if image_gallery:
                image_gallery_urls = []
                for image in image_gallery:
                    image_url = await supabase_service.upload_destination_image(image)
                    image_gallery_urls.append(image_url)
                destination.image_gallery = image_gallery_urls
            
            # Update fields
            update_data = destination_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(destination, field, value)
            
            await session.commit()
            await session.refresh(destination)
            
            return DestinationResponseModel.model_validate(destination)
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error updating destination: {str(e)}")

    async def delete_destination(self, session: AsyncSession, destination_id: str) -> bool:
        """Delete a destination"""
        try:
            destination_uuid = uuid.UUID(destination_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid destination ID format")
            
        query = select(Destination).where(Destination.id == destination_uuid)
        result = await session.exec(query)
        destination = result.first()
        
        if not destination:
            return False
        
        try:
            await session.delete(destination)
            await session.commit()
            return True
            
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=f"Error deleting destination: {str(e)}")


destination_service = DestinationService()
