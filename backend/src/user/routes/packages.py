"""
Public package routes for users
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from ...auth.dependencies import get_current_user
from ...db.main import get_session
from ...models.package import Package
from ...models.destination import Destination
from ...models.trip_type import TripType
from ...models.offer import Offer
from ...schemas.package_schemas import (
    PackageResponseModel, 
    PackageDetailResponseModel,
    PackageListResponseModel
)
from ...services.package_service import package_service

packages_router = APIRouter()


@packages_router.get("/", response_model=PackageListResponseModel)
async def get_public_packages(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    destination_id: Optional[str] = Query(None, description="Filter by destination"),
    trip_type_id: Optional[str] = Query(None, description="Filter by trip type"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),

):
    """Get public packages with filtering (only active packages)"""
    try:
        result = await package_service.get_packages(
            session=session,
            page=page,
            limit=limit,
            search=search,
            active_only=True  # Only show active packages to public
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@packages_router.get("/featured", response_model=PackageListResponseModel)
async def get_featured_packages(
    limit: int = Query(6, ge=1, le=20, description="Number of featured packages"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Get featured packages for homepage"""
    try:
        # Get featured packages
        statement = select(Package).where(
            Package.is_featured == True,
            Package.is_active == True
        ).limit(limit).order_by(Package.created_at.desc())
        
        result = await session.exec(statement)
        packages = result.all()
        
        return PackageListResponseModel(
            packages=[PackageResponseModel.model_validate(pkg) for pkg in packages],
            total=len(packages),
            page=1,
            limit=limit,
            total_pages=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@packages_router.get("/{package_id}", response_model=PackageDetailResponseModel)
async def get_package_details(
    package_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get detailed package information for public viewing"""
    try:
        # Get package with relationships
        statement = select(Package).where(
            Package.id == package_id,
            Package.is_active == True  # Only show active packages
        )
        result = await session.exec(statement)
        package = result.first()
        
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Get related data
        dest_statement = select(Destination).where(Destination.id == package.destination_id)
        dest_result = await session.exec(dest_statement)
        destination = dest_result.first()
        
        trip_statement = select(TripType).where(TripType.id == package.trip_type_id)
        trip_result = await session.exec(trip_statement)
        trip_type = trip_result.first()
        
        offer = None
        if package.offer_id:
            offer_statement = select(Offer).where(Offer.id == package.offer_id)
            offer_result = await session.exec(offer_statement)
            offer = offer_result.first()
        
        # Build detailed response
        package_dict = {
            **package.model_dump(),
            "destination_name": destination.name if destination else None,
            "trip_type_name": trip_type.name if trip_type else None,
            "offer_title": offer.title if offer else None
        }
        
        return PackageDetailResponseModel(**package_dict)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@packages_router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Search query"),
    session: AsyncSession = Depends(get_session)
):
    """Get search suggestions for packages"""
    try:
        search_term = f"%{q}%"
        
        # Search in package titles and destinations
        statement = select(Package.title).where(
            Package.title.ilike(search_term),
            Package.is_active == True
        ).limit(5)
        
        result = await session.exec(statement)
        suggestions = result.all()
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
