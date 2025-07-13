from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from ..db.main import get_session
from .service import HomeService
from ..schemas.package_schemas import PackageResponseModel
from ..schemas.blog_schemas import BlogResponseModel
from ..schemas.destination_schemas import DestinationResponseModel

home_router = APIRouter()

@home_router.get("/packages", response_model=list[PackageResponseModel])
async def get_home_packages(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: str = Query(None),
    session: AsyncSession = Depends(get_session)
):
    try:
        packages = await HomeService.get_packages(session, limit=limit, page=page, search=search)
        return packages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@home_router.get("/blogs", response_model=list[BlogResponseModel])
async def get_home_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: str = Query(None),
    session: AsyncSession = Depends(get_session)
):
    try:
        blogs = await HomeService.get_blogs(session, limit=limit, page=page, search=search)
        return blogs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@home_router.get("/destinations", response_model=list[DestinationResponseModel])
async def get_home_destinations(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: str = Query(None),
    session: AsyncSession = Depends(get_session)
):
    try:
        destinations = await HomeService.get_destinations(session, limit=limit, page=page, search=search)
        return destinations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
