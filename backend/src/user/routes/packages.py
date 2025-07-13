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
## Removed TripType and Offer imports
from ...schemas.package_schemas import (
    PackageResponseModel, 
    PackageDetailResponseModel,
    PackageListResponseModel
)
from ...services.package_service import package_service

packages_router = APIRouter()


@packages_router.get("/packages", response_model=PackageListResponseModel)
async def get_public_packages(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    destination_id: Optional[str] = Query(None, description="Filter by destination"),
    # Removed trip_type_id filter
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get public packages with filtering (only active packages, full info)"""
    try:
        result = await package_service.get_packages(
            session=session,
            page=page,
            limit=limit,
            search=search,
            active_only=True,  # Only show active packages to public
            destination_id=destination_id,
            # trip_type_id removed
            min_price=min_price,
            max_price=max_price
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@packages_router.get("/packages/featured", response_model=PackageListResponseModel)
async def get_featured_packages(
    limit: int = Query(6, ge=1, le=20, description="Number of featured packages"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    """Get featured packages for homepage (full info)"""
    try:
        result = await package_service.get_packages(
            session=session,
            page=1,
            limit=limit,
            active_only=True,
            search=None,
            destination_id=None,
            trip_type_id=None,
            min_price=None,
            max_price=None
        )
        # Filter for featured
        featured = [pkg for pkg in result["packages"] if getattr(pkg, "is_featured", False)]
        return {
            **result,
            "packages": featured,
            "total": len(featured),
            "page": 1,
            "limit": limit,
            "total_pages": 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@packages_router.get("/packages/search/suggestions")
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


@packages_router.get("/packages/{package_id}", response_model=PackageDetailResponseModel)
async def get_package_details(
    package_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get detailed package information for public viewing (full info)"""
    try:
        detail = await package_service.get_package_detail(session, package_id)
        if not detail:
            raise HTTPException(status_code=404, detail="Package not found")
        return detail
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

