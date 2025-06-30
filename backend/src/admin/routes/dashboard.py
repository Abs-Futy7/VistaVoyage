"""
Admin dashboard routes
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from ...db.main import get_session
from ...services.booking_service import booking_service
from ..dependencies import admin_access_bearer

dashboard_router = APIRouter()


@dashboard_router.get("/dashboard/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    """Get dashboard statistics from real database data"""
    try:
        from ...models.blog import Blog
        from ...models.package import Package
        from ...models.booking import Booking
        from ...auth.models import User
        
        # Count active users
        active_users_result = await session.exec(
            select(func.count(User.uid)).where(User.is_active == True)
        )
        active_users = active_users_result.first() or 0
        
        # Count total users
        total_users_result = await session.exec(select(func.count(User.uid)))
        total_users = total_users_result.first() or 0
        
        # Count total packages
        total_packages_result = await session.exec(select(func.count(Package.id)))
        total_packages = total_packages_result.first() or 0
        
        # Count active packages
        active_packages_result = await session.exec(
            select(func.count(Package.id)).where(Package.is_active == True)
        )
        active_packages = active_packages_result.first() or 0
        
        # Count total bookings
        total_bookings_result = await session.exec(select(func.count(Booking.id)))
        total_bookings = total_bookings_result.first() or 0
        
        # Count total blogs
        total_blogs_result = await session.exec(select(func.count(Blog.id)))
        total_blogs = total_blogs_result.first() or 0
        
        # Count published blogs
        published_blogs_result = await session.exec(
            select(func.count(Blog.id)).where(Blog.status == "published")
        )
        published_blogs = published_blogs_result.first() or 0
        
        # Get booking stats by status
        booking_stats = await booking_service.get_booking_stats(session)
        
        # Calculate revenue from bookings
        total_revenue_result = await session.exec(
            select(func.sum(Booking.total_amount))
        )
        total_revenue = total_revenue_result.first() or 0.0
        
        # Get recent bookings (limit 5)
        recent_bookings_result = await session.exec(
            select(Booking).order_by(Booking.created_at.desc()).limit(5)
        )
        recent_bookings = [
            {
                "id": str(booking.id),
                "customerName": booking.customer_name,
                "packageId": str(booking.package_id),
                "status": booking.status,
                "totalAmount": booking.total_amount,
                "guests": booking.guests,
                "travelDate": booking.travel_date.isoformat() + "Z",
                "bookingDate": booking.booking_date.isoformat() + "Z"
            }
            for booking in recent_bookings_result.all()
        ]
        
        # Get recent blogs (limit 5)
        recent_blogs_result = await session.exec(
            select(Blog).order_by(Blog.created_at.desc()).limit(5)
        )
        recent_blogs = [
            {
                "id": str(blog.id),
                "title": blog.title,
                "author_id": str(blog.author_id),
                "createdAt": blog.created_at.isoformat() + "Z",
                "status": blog.status,
                "category": blog.category
            }
            for blog in recent_blogs_result.all()
        ]
        
        # Get recent users (limit 5)
        recent_users_result = await session.exec(
            select(User).order_by(User.created_at.desc()).limit(5)
        )
        recent_users = [
            {
                "id": str(user.uid),
                "fullName": user.full_name,
                "email": user.email,
                "createdAt": user.created_at.isoformat() + "Z",
                "isActive": user.is_active,
                "city": user.city,
                "country": user.country
            }
            for user in recent_users_result.all()
        ]
        
        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalPackages": total_packages,
            "activePackages": active_packages,
            "totalBookings": total_bookings,
            "totalBlogs": total_blogs,
            "publishedBlogs": published_blogs,
            "revenue": {
                "total": total_revenue,
                "thisMonth": total_revenue * 0.2,  # Mock calculation - you can implement proper monthly calculation
                "lastMonth": total_revenue * 0.16,  # Mock calculation
                "growth": 25  # Mock calculation
            },
            "bookingsByStatus": booking_stats,
            "recentBookings": recent_bookings,
            "recentUsers": recent_users,
            "recentBlogs": recent_blogs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@dashboard_router.get("/system/stats")
async def get_system_stats(
    session: AsyncSession = Depends(get_session),
    token_data: dict = Depends(admin_access_bearer)
):
    """Get comprehensive system statistics"""
    try:
        from ...models.destination import Destination
        from ...models.trip_type import TripType
        from ...models.activity import Activity
        from ...models.package import Package
        from ...models.booking import Booking
        from ...models.blog import Blog
        from ...models.offer import Offer
        from ...models.promo_code import PromoCode
        from ...auth.models import User
        
        stats = {}
        
        # Users
        total_users = await session.exec(select(func.count(User.uid)))
        active_users = await session.exec(select(func.count(User.uid)).where(User.is_active == True))
        stats["users"] = {
            "total": total_users.first() or 0,
            "active": active_users.first() or 0
        }
        
        # Destinations
        total_destinations = await session.exec(select(func.count(Destination.id)))
        active_destinations = await session.exec(select(func.count(Destination.id)).where(Destination.is_active == True))
        stats["destinations"] = {
            "total": total_destinations.first() or 0,
            "active": active_destinations.first() or 0
        }
        
        # Trip Types
        total_trip_types = await session.exec(select(func.count(TripType.id)))
        active_trip_types = await session.exec(select(func.count(TripType.id)).where(TripType.is_active == True))
        stats["trip_types"] = {
            "total": total_trip_types.first() or 0,
            "active": active_trip_types.first() or 0
        }
        
        # Activities
        total_activities = await session.exec(select(func.count(Activity.id)))
        active_activities = await session.exec(select(func.count(Activity.id)).where(Activity.is_active == True))
        stats["activities"] = {
            "total": total_activities.first() or 0,
            "active": active_activities.first() or 0
        }
        
        # Packages
        total_packages = await session.exec(select(func.count(Package.id)))
        active_packages = await session.exec(select(func.count(Package.id)).where(Package.is_active == True))
        featured_packages = await session.exec(select(func.count(Package.id)).where(Package.is_featured == True))
        stats["packages"] = {
            "total": total_packages.first() or 0,
            "active": active_packages.first() or 0,
            "featured": featured_packages.first() or 0
        }
        
        # Bookings
        total_bookings = await session.exec(select(func.count(Booking.id)))
        pending_bookings = await session.exec(select(func.count(Booking.id)).where(Booking.status == "pending"))
        confirmed_bookings = await session.exec(select(func.count(Booking.id)).where(Booking.status == "confirmed"))
        stats["bookings"] = {
            "total": total_bookings.first() or 0,
            "pending": pending_bookings.first() or 0,
            "confirmed": confirmed_bookings.first() or 0
        }
        
        # Blogs
        total_blogs = await session.exec(select(func.count(Blog.id)))
        published_blogs = await session.exec(select(func.count(Blog.id)).where(Blog.status == "published"))
        draft_blogs = await session.exec(select(func.count(Blog.id)).where(Blog.status == "draft"))
        stats["blogs"] = {
            "total": total_blogs.first() or 0,
            "published": published_blogs.first() or 0,
            "drafts": draft_blogs.first() or 0
        }
        
        # Offers
        total_offers = await session.exec(select(func.count(Offer.id)))
        active_offers = await session.exec(select(func.count(Offer.id)).where(Offer.is_active == True))
        stats["offers"] = {
            "total": total_offers.first() or 0,
            "active": active_offers.first() or 0
        }
        
        # Promo Codes
        total_promo_codes = await session.exec(select(func.count(PromoCode.id)))
        active_promo_codes = await session.exec(select(func.count(PromoCode.id)).where(PromoCode.is_active == True))
        stats["promo_codes"] = {
            "total": total_promo_codes.first() or 0,
            "active": active_promo_codes.first() or 0
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@dashboard_router.post("/setup-storage")
async def setup_supabase_storage(token_data: dict = Depends(admin_access_bearer)):
    """Setup Supabase storage bucket for blog images (admin only)"""
    try:
        from ...services.supabase_service import supabase_service
        
        # Try to create the bucket (will fail if it already exists, which is fine)
        try:
            response = supabase_service.supabase.storage.create_bucket(
                id="blogs-images",
                options={
                    "public": True,
                    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"],
                    "file_size_limit": 5242880  # 5MB
                }
            )
            return {"message": "Storage bucket created successfully", "bucket": "blogs-images"}
        except Exception as e:
            # Bucket might already exist
            if "already exists" in str(e).lower():
                return {"message": "Storage bucket already exists", "bucket": "blogs-images"}
            else:
                raise HTTPException(status_code=500, detail=f"Failed to create bucket: {str(e)}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
