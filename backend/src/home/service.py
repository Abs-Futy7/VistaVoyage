from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ..models.package import Package
from ..models.blog import Blog, BlogStatus
from ..models.destination import Destination

class HomeService:
    @staticmethod
    async def get_packages(session: AsyncSession, limit: int = 12, page: int = 1, search: str = None):
        query = select(Package)
        if search:
            query = query.where(Package.title.ilike(f"%{search}%"))
        query = query.offset((page - 1) * limit).limit(limit)
        result = await session.exec(query)
        packages = result.all()
        return packages

    @staticmethod
    async def get_blogs(session: AsyncSession, limit: int = 12, page: int = 1, search: str = None):
        query = select(Blog).where(Blog.status == BlogStatus.PUBLISHED)
        if search:
            query = query.where(Blog.title.ilike(f"%{search}%"))
        query = query.offset((page - 1) * limit).limit(limit)
        result = await session.exec(query)
        blogs = result.all()
        return blogs

    @staticmethod
    async def get_destinations(session: AsyncSession, limit: int = 12, page: int = 1, search: str = None):
        query = select(Destination)
        if search:
            query = query.where(Destination.name.ilike(f"%{search}%"))
        query = query.offset((page - 1) * limit).limit(limit)
        result = await session.exec(query)
        destinations = result.all()
        return destinations
