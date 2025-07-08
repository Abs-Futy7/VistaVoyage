from typing import Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime, timedelta
import uuid

from .activity_service import activity_service
from .destination_service import destination_service
from .offer_service import offer_service
from .trip_type_service import trip_type_service
from .package_service import package_service
from .booking_service import BookingService
from .promo_code_service import PromoCodeService
from .admin_user_service import AdminUserService
from .blog_service import blog_service


class DashboardService:
    """Service for admin dashboard statistics and data aggregation"""
    
    def __init__(self):
        self.booking_service = BookingService()
        self.admin_user_service = AdminUserService()
    
    async def get_dashboard_overview(self, session: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive dashboard overview statistics"""
        
        # Get stats from all services
        user_stats = await self.admin_user_service.get_user_stats(session)
        package_stats = await package_service.get_package_stats(session)
        booking_stats = await self.booking_service.get_booking_stats(session)
        blog_stats = await blog_service.get_blog_stats(session) if hasattr(blog_service, 'get_blog_stats') else {}
        activity_stats = await activity_service.get_activity_stats(session)
        destination_stats = await destination_service.get_destination_stats(session)
        offer_stats = await offer_service.get_offer_stats(session)
        trip_type_stats = await trip_type_service.get_trip_type_stats(session)
        promo_stats = await PromoCodeService.get_promo_code_stats(session)
        
        # Combine all statistics
        dashboard_stats = {
            "overview": {
                "total_users": user_stats.get("total_users", 0),
                "active_users": user_stats.get("active_users", 0),
                "total_packages": package_stats.get("total_packages", 0),
                "active_packages": package_stats.get("active_packages", 0),
                "total_bookings": booking_stats.get("total_bookings", 0),
                "confirmed_bookings": booking_stats.get("bookings_by_status", {}).get("confirmed", 0),
                "total_revenue": booking_stats.get("total_revenue", 0.0),
                "total_destinations": destination_stats.get("total_destinations", 0),
                "total_activities": activity_stats.get("total_activities", 0),
                "total_offers": offer_stats.get("total_offers", 0),
                "valid_offers": offer_stats.get("valid_offers", 0),
                "total_promo_codes": promo_stats.get("total_promo_codes", 0),
                "valid_promo_codes": promo_stats.get("valid_promo_codes", 0)
            },
            "breakdowns": {
                "users": user_stats,
                "packages": package_stats,
                "bookings": booking_stats,
                "blogs": blog_stats,
                "activities": activity_stats,
                "destinations": destination_stats,
                "offers": offer_stats,
                "trip_types": trip_type_stats,
                "promo_codes": promo_stats
            }
        }
        
        return dashboard_stats
    
    async def get_recent_activity(self, session: AsyncSession, limit: int = 10) -> Dict[str, List[Dict]]:
        """Get recent activity across the platform"""
        from ..models.booking import Booking
        from ..models.blog import Blog
        from ..auth.models import User
        
        # Recent bookings
        recent_bookings_query = select(Booking).order_by(Booking.created_at.desc()).limit(limit)
        recent_bookings_result = await session.exec(recent_bookings_query)
        recent_bookings = []
        
        for booking in recent_bookings_result.all():
            recent_bookings.append({
                "id": str(booking.id),
                "user_id": str(booking.user_id),
                "package_id": str(booking.package_id),
                "status": booking.status,
                "total_amount": float(booking.total_amount),
                "travel_date": booking.travel_date.isoformat() if booking.travel_date else None,
                "created_at": booking.created_at.isoformat()
            })
        
        # Recent user registrations
        recent_users_query = select(User).order_by(User.created_at.desc()).limit(limit)
        recent_users_result = await session.exec(recent_users_query)
        recent_users = []
        
        for user in recent_users_result.all():
            recent_users.append({
                "id": str(user.uid),
                "full_name": user.full_name,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat()
            })
        
        # Recent blogs
        recent_blogs_query = select(Blog).order_by(Blog.created_at.desc()).limit(limit)
        recent_blogs_result = await session.exec(recent_blogs_query)
        recent_blogs = []
        
        for blog in recent_blogs_result.all():
            recent_blogs.append({
                "id": str(blog.id),
                "title": blog.title,
                "author": blog.author,
                "status": blog.status,
                "created_at": blog.created_at.isoformat()
            })
        
        return {
            "recent_bookings": recent_bookings,
            "recent_users": recent_users,
            "recent_blogs": recent_blogs
        }
    
    async def get_revenue_analytics(self, session: AsyncSession, days: int = 30) -> Dict[str, Any]:
        """Get revenue analytics for the specified number of days"""
        from ..models.booking import Booking
        from decimal import Decimal
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # First get confirmed bookings in the period
        bookings_query = select(Booking).where(
            Booking.created_at >= start_date,
            Booking.created_at <= end_date,
            Booking.status == 'confirmed'
        )
        result = await session.exec(bookings_query)
        confirmed_bookings = result.all()
        
        # Calculate total revenue manually to avoid casting issues
        total_revenue = sum((Decimal(str(booking.total_amount)) for booking in confirmed_bookings), Decimal('0'))
        
        # Total bookings count in period (all statuses)
        all_bookings_query = select(func.count(Booking.id)).where(
            Booking.created_at >= start_date,
            Booking.created_at <= end_date
        )
        bookings_result = await session.exec(all_bookings_query)
        total_bookings = bookings_result.first() or 0
        
        # Average booking value
        avg_booking_value = float(total_revenue) / total_bookings if total_bookings > 0 else 0
        
        return {
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "total_revenue": float(total_revenue),
            "total_bookings": total_bookings,
            "average_booking_value": avg_booking_value
        }
    
    async def get_system_health(self, session: AsyncSession) -> Dict[str, Any]:
        """Get system health metrics"""
        from ..models import Package, Booking, Blog
        from ..auth.models import User
        
        # Database health checks
        try:
            # Test basic queries
            user_count = await session.exec(select(func.count(User.uid)))
            package_count = await session.exec(select(func.count(Package.id)))
            booking_count = await session.exec(select(func.count(Booking.id)))
            blog_count = await session.exec(select(func.count(Blog.id)))
            
            db_healthy = True
            db_message = "Database connection successful"
        except Exception as e:
            db_healthy = False
            db_message = f"Database error: {str(e)}"
        
        return {
            "database": {
                "healthy": db_healthy,
                "message": db_message
            },
            "timestamp": datetime.utcnow().isoformat()
        }


# Create singleton instance
dashboard_service = DashboardService()
