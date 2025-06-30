# VistaVoyage Admin Panel

A comprehensive admin panel for managing the VistaVoyage travel booking platform. This admin panel provides full CRUD operations for users, packages, bookings, and blogs with a modern, responsive interface.

## Features

### 🏠 Dashboard
- **Real-time Analytics**: View key metrics including total users, packages, bookings, and revenue
- **Interactive Charts**: Revenue comparison and booking status distribution with Recharts
- **Recent Activity**: Latest bookings and user registrations
- **Growth Indicators**: Month-over-month growth percentages with trend indicators

### 👥 User Management
- **User Overview**: Complete list of registered users with search functionality
- **User Statistics**: Active/inactive users count and new registrations
- **User Actions**: Toggle user status (activate/deactivate) and delete users
- **User Details**: Email, location, join date, booking count, and last login information

### 📦 Package Management
- **Package CRUD**: Create, read, update, and delete travel packages
- **Package Details**: Title, description, price, duration, location, and images
- **Package Status**: Toggle active/inactive status
- **Search & Filter**: Find packages quickly with real-time search

### 📝 Blog Management
- **Content Creation**: Rich blog post creation with title, content, excerpt, and tags
- **Author Management**: Assign authors to blog posts
- **Category System**: Organize blogs by categories (Travel Guide, Budget Travel, etc.)
- **Publishing Status**: Draft/Published status management
- **Media Support**: Cover image uploads and management

### 📋 Booking Management
- **Booking Overview**: View all customer bookings with detailed information
- **Status Management**: Update booking status (Confirmed, Pending, Cancelled, Completed)
- **Customer Details**: Full customer information and booking history
- **Revenue Tracking**: Track total revenue and individual booking amounts

## Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icons
- **Recharts**: Charts and data visualization
- **Sonner**: Toast notifications

### State Management & API
- **Custom Hooks**: Modular state management with useAdmin hooks
- **API Services**: Centralized API calls with AdminService
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Skeleton loading for better UX

## File Structure

```
frontend/
├── app/admin/
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── page.tsx            # Dashboard
│   ├── blogs/page.tsx      # Blog management
│   ├── bookings/page.tsx   # Booking management
│   ├── packages/page.tsx   # Package management
│   └── users/page.tsx      # User management
├── hooks/
│   └── useAdmin.ts         # Admin-specific hooks
├── lib/api/
│   ├── services/admin.ts   # Admin API service
│   └── types.ts           # TypeScript interfaces
└── components/ui/          # Reusable UI components
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Required Packages
The admin panel uses these additional packages:
- `sonner` - Toast notifications
- `recharts` - Charts and graphs
- `@radix-ui/react-dialog` - Modal dialogs
- `class-variance-authority` - Component variants

### 3. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start Development Server
```bash
npm run dev
```

The admin panel will be available at:
- Local: http://localhost:3001/admin
- Dashboard: http://localhost:3001/admin
- Users: http://localhost:3001/admin/users
- Packages: http://localhost:3001/admin/packages
- Blogs: http://localhost:3001/admin/blogs
- Bookings: http://localhost:3001/admin/bookings

## API Integration

The admin panel is designed to work with a RESTful API. The expected endpoints are:

### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

### Users
- `GET /api/v1/admin/users` - List users (with pagination)
- `GET /api/v1/admin/users/:id` - Get user details
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `PATCH /api/v1/admin/users/:id/toggle-status` - Toggle user status

### Packages
- `GET /api/v1/admin/packages` - List packages
- `POST /api/v1/admin/packages` - Create package
- `PUT /api/v1/admin/packages/:id` - Update package
- `DELETE /api/v1/admin/packages/:id` - Delete package
- `PATCH /api/v1/admin/packages/:id/toggle-status` - Toggle package status

### Blogs
- `GET /api/v1/admin/blogs` - List blogs
- `POST /api/v1/admin/blogs` - Create blog
- `PUT /api/v1/admin/blogs/:id` - Update blog
- `DELETE /api/v1/admin/blogs/:id` - Delete blog
- `PATCH /api/v1/admin/blogs/:id/toggle-status` - Toggle blog status

### Bookings
- `GET /api/v1/admin/bookings` - List bookings
- `PATCH /api/v1/admin/bookings/:id/status` - Update booking status
- `DELETE /api/v1/admin/bookings/:id` - Delete booking

## Features in Detail

### Dashboard Analytics
- **Revenue Tracking**: Visual comparison of current vs previous month
- **Booking Distribution**: Pie chart showing booking status breakdown
- **User Growth**: Active vs inactive user statistics
- **Recent Activity**: Last 5 bookings and user registrations

### User Management
- **Bulk Operations**: Select multiple users for batch operations
- **Advanced Search**: Search by name, email, or location
- **User Status**: Active/inactive toggle with confirmation
- **User Details**: Comprehensive user information display

### Package Management
- **Rich Editor**: Full package creation with images and itinerary
- **Pricing Management**: Dynamic pricing with currency formatting
- **Availability**: Date-based availability management
- **Category System**: Organize packages by type and difficulty

### Blog Management
- **WYSIWYG Editor**: Rich text editing for blog content
- **SEO Optimization**: Meta descriptions and keyword management
- **Tag System**: Categorize blogs with tags
- **Publishing Workflow**: Draft → Review → Publish workflow

### Booking Management
- **Status Workflow**: Pending → Confirmed → Completed/Cancelled
- **Customer Communication**: Integration ready for email notifications
- **Payment Tracking**: Revenue and payment status tracking
- **Reporting**: Export bookings for financial reporting

## Demo Data

The admin panel includes comprehensive demo data for testing:
- **6 Sample Users**: With varied profiles and activity levels
- **3 Sample Blogs**: Different categories and publishing states
- **Multiple Packages**: Various destinations and price points
- **Booking Examples**: Different status types and amounts

## Security Features

- **Role-based Access**: Admin-only routes protection
- **Input Validation**: Client-side validation for all forms
- **Confirmation Dialogs**: Destructive actions require confirmation
- **Error Boundaries**: Graceful error handling and recovery

## Responsive Design

- **Mobile-First**: Optimized for mobile and tablet devices
- **Collapsible Sidebar**: Space-efficient navigation
- **Adaptive Grid**: Responsive grid layouts for different screen sizes
- **Touch-Friendly**: Large tap targets and gesture support

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js Image component integration
- **Code Splitting**: Automatic code splitting by Next.js
- **Caching**: API response caching for better performance

## Development Notes

### Hot Reload
The development server supports hot reload for instant feedback during development.

### TypeScript
All components and services are fully typed for better development experience and fewer runtime errors.

### Component Library
Uses Shadcn/ui components which are customizable and accessible by default.

### Error Handling
Comprehensive error handling with user-friendly messages and fallback UI.

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: More detailed charts and reports
- **Bulk Operations**: Multi-select and batch actions
- **Export Functionality**: CSV/PDF export for all data
- **Notification System**: In-app notifications for important events
- **Advanced Search**: Filters and sorting options
- **Audit Logs**: Track all admin actions for security

## Support

For issues or questions regarding the admin panel:
1. Check the browser console for any errors
2. Verify API endpoints are configured correctly
3. Ensure all required environment variables are set
4. Check network requests in browser dev tools

The admin panel is designed to be intuitive and user-friendly while providing comprehensive management capabilities for the VistaVoyage platform.
