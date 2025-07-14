# 🌍 VistaVoyage — Full Stack Travel Booking Platform

A comprehensive travel booking platform built with modern technologies, featuring package management, booking system with promo codes, user authentication, and admin dashboard with role-based access control.

---

## 🧱 Tech Stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| **Frontend** | Next.js 15.3.4 (App Router), React 19, TypeScript, Tailwind CSS 4, ShadCN UI |
| **Backend**  | FastAPI, SQLModel, SQLAlchemy, Alembic, Pydantic, AsyncPG    |
| **Database** | PostgreSQL with UUID primary keys                            |
| **Storage**  | Supabase Storage for images and file management              |
| **Caching** | Redis for session management and performance                  |
| **Auth**     | JWT Authentication with dual role system (User + Admin)      |
| **UI**       | Lucide Icons, Sonner Toasts, Radix UI, Framer Motion        |
| **Styling**  | Professional blue gradient theme with glassmorphism effects  |

---

## 📁 Project Structure

```
VistaVoyage/
├── backend/                    # FastAPI Backend Server
│   ├── src/                    # Source code directory
│   │   ├── admin/              # Admin routes and authentication
│   │   │   ├── auth_routes.py  # Admin authentication endpoints
│   │   │   ├── dependencies.py # Admin authorization middleware  
│   │   │   ├── routes/         # Admin management routes
│   │   │   │   ├── dashboard.py    # System statistics & analytics
│   │   │   │   ├── users.py        # User management
│   │   │   │   ├── packages.py     # Package CRUD operations
│   │   │   │   ├── bookings.py     # Booking management
│   │   │   │   ├── destinations.py # Destination management
│   │   │   │   ├── blogs.py        # Blog management
│   │   │   │   └── promo_codes.py  # Promo code management
│   │   │   └── schemas.py      # Admin-specific Pydantic models
│   │   ├── auth/               # User authentication system
│   │   │   ├── routes.py       # Login, register, profile routes
│   │   │   ├── dependencies.py # JWT token validation
│   │   │   ├── models.py       # User database models
│   │   │   └── utils.py        # Password hashing, token creation
│   │   ├── user/               # User-facing routes  
│   │   │   └── routes/         # User API endpoints
│   │   │       ├── packages.py     # Browse packages
│   │   │       ├── bookings.py     # Create/manage bookings
│   │   │       ├── destinations.py # View destinations
│   │   │       ├── blogs.py        # Read blogs
│   │   │       └── promo_codes.py  # Validate promo codes
│   │   ├── home/               # Public routes (no auth required)
│   │   │   └── routes.py       # Home page data endpoints
│   │   ├── db/                 # Database configuration
│   │   │   ├── main.py         # Database connection setup
│   │   │   └── redis.py        # Redis caching configuration
│   │   ├── models/             # SQLModel database models
│   │   │   ├── user.py         # User model
│   │   │   ├── package.py      # Travel package model
│   │   │   ├── booking.py      # Booking model  
│   │   │   ├── destination.py  # Destination model
│   │   │   ├── blog.py         # Blog post model
│   │   │   └── promo_code.py   # Promo code model
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic layer
│   │   └── utils/              # Utility functions
│   ├── alembic/                # Database migration management
│   │   ├── versions/           # Migration files
│   │   └── env.py              # Alembic configuration
│   ├── scripts/                # Utility scripts
│   │   └── create_default_admin.py # Admin user creation
│   ├── env/                    # Python virtual environment
│   ├── main.py                 # FastAPI application entry point
│   ├── admin_server.py         # Alternative admin server setup
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables
├── frontend/                   # Next.js Frontend Application
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── dashboard/      # Admin analytics dashboard
│   │   │   ├── packages/       # Package management UI
│   │   │   ├── bookings/       # Booking management UI
│   │   │   ├── destinations/   # Destination management UI
│   │   │   ├── blogs/          # Blog management UI
│   │   │   ├── promo-codes/    # Promo code management UI
│   │   │   └── users/          # User management UI
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # User login page
│   │   │   └── register/       # User registration page
│   │   ├── user/               # User dashboard pages
│   │   │   ├── dashboard/      # User profile dashboard
│   │   │   ├── bookings/       # User booking history
│   │   │   └── profile/        # Profile management
│   │   ├── packages/           # Package browsing pages
│   │   ├── destinations/       # Destination browsing pages
│   │   ├── blogs/              # Blog reading pages
│   │   ├── debug-profile/      # Development debugging tools
│   │   ├── globals.css         # Global styles with theme system
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # ShadCN UI base components
│   │   ├── auth/               # Authentication components
│   │   ├── admin/              # Admin-specific components
│   │   ├── booking/            # Booking-related components
│   │   ├── Hero.tsx            # Landing page hero section
│   │   ├── Navbar.tsx          # Navigation component
│   │   ├── Footer.tsx          # Footer component
│   │   ├── TopDestinations.tsx # Featured destinations
│   │   ├── PopularPackages.tsx # Popular packages display
│   │   ├── TravelBlogs.tsx     # Blog listing component
│   │   └── Bot.tsx             # AI chat bot component
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication state management
│   │   ├── useAdmin.ts         # Admin operations hook
│   │   ├── useBookings.ts      # Booking operations hook
│   │   ├── useProfile.ts       # User profile management
│   │   └── useProtectedRoute.ts # Route protection logic
│   ├── lib/                    # Utilities and API services
│   │   ├── api/                # API service layer
│   │   │   ├── client.ts       # HTTP client with auth handling
│   │   │   ├── config.ts       # API endpoints configuration
│   │   │   ├── types.ts        # TypeScript API interfaces
│   │   │   ├── diagnostics.ts  # API connection testing
│   │   │   └── services/       # Domain-specific API services
│   │   │       ├── auth.ts     # Authentication API calls
│   │   │       ├── admin.ts    # Admin operations API
│   │   │       ├── packages.ts # Package API operations
│   │   │       ├── bookings.ts # Booking API operations
│   │   │       ├── destinations.ts # Destination API calls
│   │   │       ├── blog.ts     # Blog API operations
│   │   │       └── promocode.ts # Promo code validation
│   │   └── utils.ts            # Utility functions
│   ├── public/                 # Static assets
│   │   ├── images/             # Image assets
│   │   ├── icons/              # Icon files
│   │   ├── cartoon_plane.glb   # 3D model assets
│   │   └── scene.gltf          # 3D scene files
│   ├── utils/                  # Frontend utilities
│   │   └── contants.ts         # Application constants
│   ├── package.json            # Node.js dependencies
│   ├── next.config.ts          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── components.json         # ShadCN UI configuration
│   └── .env.local              # Frontend environment variables
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** (for backend with FastAPI)
- **Node.js 18+** (for frontend with Next.js 15)
- **PostgreSQL 13+** (primary database)
- **Redis** (for caching and session management)
- **Git** (version control)

### 🔴 Redis Setup (Required)

The application requires Redis for caching and session management:

```bash
# Pull and run Redis container with Docker
docker run -d --name redis-vistavoyage -p 6379:6379 redis:alpine

# Verify Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it redis-vistavoyage redis-cli ping
# Should return: PONG
```

**Redis Configuration:**
- **Host:** localhost
- **Port:** 6379
- **Container:** redis-vistavoyage

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Abs-Futy7/VistaVoyage.git
cd VistaVoyage
```

### 2️⃣ Environment Setup

Create environment files for both frontend and backend:

**→ backend/.env**

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vistavoyage

# Supabase Configuration (for file storage)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Configuration - User Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
JWT_ALGORITHM=HS256

# Admin JWT Configuration - Separate from user auth
ADMIN_JWT_SECRET_KEY=your-admin-secret-key-different-from-user
ADMIN_JWT_ALGORITHM=HS256
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Default Admin Account (for initial setup)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@vistavoyage.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_FULL_NAME=System Administrator

# Server Configuration
ENVIRONMENT=development
DEBUG=True
```

**→ frontend/.env.local**

```env
# API Configuration - Backend connection
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME="VistaVoyage"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development settings
NODE_ENV=development
```

### 3️⃣ Backend Setup (FastAPI + SQLModel)

**📦 Navigate to backend and set up virtual environment:**

```bash
cd backend
python -m venv env
```

**🔧 Activate virtual environment:**

```bash
# Windows PowerShell
env\Scripts\Activate.ps1

# Windows Command Prompt
env\Scripts\activate.bat

# macOS/Linux
source env/bin/activate
```

**📥 Install dependencies:**

```bash
pip install -r requirements.txt
```

**🗄️ Database Setup:**

```sql
-- Create database in PostgreSQL
CREATE DATABASE vistavoyage;
CREATE USER vistavoyage_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vistavoyage TO vistavoyage_user;
```

**🔄 Run database migrations:**

```bash
# Initialize and run all migrations
alembic upgrade head

# Create default admin user (optional)
python scripts/create_default_admin.py
```

**🚀 Start the FastAPI development server:**

```bash
# Main application server (recommended)
python main.py

# Alternative: Using uvicorn directly
uvicorn src:app --reload --port 8000

# Alternative: Admin-specific server
python admin_server.py
```

**✅ Backend running at:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)

### 4️⃣ Frontend Setup (Next.js 15)

**📂 Navigate to frontend directory:**

```bash
cd ../frontend  # from backend directory
```

**📦 Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

**🚀 Start the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**✅ Frontend running at:** http://localhost:3000

---

## 🔗 API Documentation & Architecture

### API Endpoints Overview

**Backend Server:** http://localhost:8000
- **Interactive API Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)

### API Structure

```
/api/v1/
├── auth/                   # User Authentication (No admin privileges)
│   ├── POST /login         # User login
│   ├── POST /register      # User registration
│   ├── POST /logout        # User logout
│   ├── GET  /refresh_token # Refresh access token
│   ├── GET  /profile       # Get user profile
│   ├── PATCH /profile      # Update user profile
│   └── GET  /health        # Health check
├── admin/                  # Admin Authentication & Management
│   ├── auth/               # Admin Authentication
│   │   ├── POST /login     # Admin login (separate from user)
│   │   ├── POST /create    # Create new admin
│   │   ├── POST /refresh   # Admin token refresh
│   │   └── POST /logout    # Admin logout
│   ├── dashboard/          # Admin Dashboard
│   │   ├── GET /stats      # Dashboard statistics
│   │   └── GET /system/stats # Detailed system metrics
│   ├── users/              # User Management
│   │   ├── GET /users      # List all users (paginated)
│   │   ├── PATCH /users/{id}/toggle-status # Enable/disable user
│   │   └── DELETE /users/{id} # Delete user account
│   ├── packages/           # Package Management
│   │   ├── GET /packages   # List packages (admin view)
│   │   ├── POST /packages  # Create package
│   │   ├── PUT /packages/{id} # Update package
│   │   ├── DELETE /packages/{id} # Delete package
│   │   └── PATCH /packages/{id}/toggle-active # Enable/disable
│   ├── destinations/       # Destination Management
│   │   ├── GET /destinations # List destinations
│   │   ├── POST /destinations # Create destination
│   │   ├── PUT /destinations/{id} # Update destination
│   │   └── DELETE /destinations/{id} # Delete destination
│   ├── bookings/           # Booking Management
│   │   ├── GET /bookings   # List all bookings
│   │   └── PATCH /bookings/{id}/status # Update booking status
│   ├── blogs/              # Blog Management
│   │   ├── GET /blogs      # List blogs (admin view)
│   │   ├── POST /blogs     # Create blog post
│   │   ├── PUT /blogs/{id} # Update blog post
│   │   ├── DELETE /blogs/{id} # Delete blog post
│   │   └── PATCH /blogs/{id}/toggle-publish # Publish/unpublish
│   └── promo-codes/        # Promo Code Management
│       ├── GET /promo-codes # List promo codes
│       ├── POST /promo-codes # Create promo code
│       ├── PUT /promo-codes/{id} # Update promo code
│       └── DELETE /promo-codes/{id} # Delete promo code
├── user/                   # User-Facing Endpoints (Authenticated)
│   ├── packages/           # Browse Packages
│   │   ├── GET /packages   # List available packages
│   │   └── GET /packages/{id} # Package details
│   ├── destinations/       # Browse Destinations
│   │   ├── GET /destinations # List destinations
│   │   └── GET /destinations/{id} # Destination details
│   ├── bookings/           # User Bookings
│   │   ├── GET /bookings   # User's booking history
│   │   ├── POST /bookings  # Create new booking
│   │   ├── GET /bookings/{id} # Booking details
│   │   └── PATCH /bookings/{id}/cancel # Cancel booking
│   ├── promo_codes/        # Promo Code Validation
│   │   ├── GET /promo_codes # Available promo codes
│   │   ├── POST /validate  # Validate promo code
│   │   └── GET /check/{code} # Check specific code
│   └── blogs/              # Read Blogs
│       ├── GET /blogs      # List published blogs
│       └── GET /blogs/{id} # Blog post details
└── home/                   # Public Endpoints (No Authentication)
    ├── GET /packages       # Featured packages for homepage
    ├── GET /blogs          # Latest blog posts
    └── GET /destinations   # Popular destinations
```

### Authentication Flow

The system implements **dual authentication** for users and admins:

#### User Authentication
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "city": "New York",
    "country": "USA",
    "phoneNumber": "+1234567890",
    "passportNumber": "A12345678",
    "isActive": true
  }
}
```

#### Admin Authentication
```json
POST /api/v1/admin/auth/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "message": "Admin login successful",
  "access_token": "admin_jwt_token",
  "refresh_token": "admin_refresh_token",
  "admin": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@vistavoyage.com",
    "full_name": "System Administrator",
    "role": "super_admin"
  }
}
```

### Making API Requests

```bash
# User endpoints - use user token
curl -X GET "http://localhost:8000/api/v1/user/packages" \
  -H "Authorization: Bearer USER_JWT_TOKEN"

# Admin endpoints - use admin token  
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Public endpoints - no token required
curl -X GET "http://localhost:8000/api/v1/home/packages"
```

---

## 👥 User Roles & Features

### 🔧 Admin Features (Admin Dashboard)

**Admin Panel Access:** http://localhost:3000/admin
- **Separate Authentication:** Independent admin login system
- **Role-Based Access:** Super admin privileges required

#### Core Admin Capabilities:
- **📊 Analytics Dashboard:** Real-time system statistics and metrics
- **👤 User Management:** View, manage, and moderate user accounts
- **🏖️ Package Management:** Create, edit, delete, and manage travel packages
- **📅 Booking Management:** Monitor and manage all user bookings
- **🌍 Destination Management:** Add and manage travel destinations
- **📝 Blog Management:** Create, edit, and publish travel blog content
- **🎫 Promo Code Management:** Create and manage discount codes
- **🖼️ Media Management:** Upload and manage images via Supabase storage
- **🔒 Access Control:** Manage admin accounts and permissions

### 👤 User Features (Customer Portal)

**User Access:** http://localhost:3000/user/dashboard
- **JWT Authentication:** Secure user login and registration
- **Profile Management:** Personal information and preferences

#### Core User Capabilities:
- **🔍 Package Discovery:** Search and filter travel packages with advanced filters
- **🌟 Featured Content:** Browse popular packages and destinations
- **📱 Booking System:** Complete booking flow with promo code support
- **💳 Payment Integration:** Secure booking confirmation (ready for payment gateway)
- **📖 Travel Blogs:** Read travel guides and destination information
- **📋 Booking History:** View and manage personal booking records
- **🎟️ Promo Codes:** Apply discount codes during booking process
- **👤 Profile Settings:** Update personal information and preferences
- **🔐 Account Security:** Password management and account settings

### 🎯 Core Platform Features

#### 🌟 Public Features (No Authentication Required)
- **🏠 Landing Page:** Hero section with featured destinations and packages
- **🌍 Destination Showcase:** Popular travel destinations with beautiful imagery
- **📦 Package Preview:** Featured travel packages with pricing
- **📝 Blog Articles:** Travel guides and destination content
- **🔍 Search Functionality:** Basic package and destination search
- **📱 Responsive Design:** Mobile-first responsive UI design
- **🎨 Modern UI:** Professional blue gradient theme with glassmorphism effects

#### 🔒 Authentication System
- **Dual Role System:** Separate authentication for users and administrators
- **JWT Security:** Stateless token-based authentication
- **Token Refresh:** Automatic token renewal for seamless experience
- **Password Security:** Bcrypt hashing for secure password storage
- **Session Management:** Redis-powered session management
- **Route Protection:** Role-based access control throughout the application

#### 💎 Advanced Features
- **🎫 Promo Code Engine:** Advanced discount validation and application system
- **📊 Analytics Dashboard:** Comprehensive business metrics and insights
- **🖼️ File Management:** Supabase integration for secure file storage
- **⚡ Performance:** Redis caching for optimal response times
- **🔍 Search & Filtering:** Advanced search with multiple filter options
- **📱 Real-time Updates:** Dynamic content updates without page refresh
- **🎨 Professional Design:** Consistent design system with animation effects

---

## 🗄️ Database Schema & Models

The application uses **PostgreSQL** with **SQLModel** (SQLAlchemy + Pydantic) for type-safe database operations:

### 📋 Core Database Models

#### 👤 **User Model** (`src/models/user.py`)
```python
class User(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True)
    password_hash: str
    city: Optional[str] = Field(max_length=100)
    country: Optional[str] = Field(max_length=100)
    phone_number: Optional[str] = Field(max_length=20)
    passport_number: Optional[str] = Field(max_length=50)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 🏖️ **Package Model** (`src/models/package.py`)
```python
class Package(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    title: str = Field(max_length=200)
    description: str
    price: float = Field(ge=0)
    duration_days: int = Field(ge=1)
    duration_nights: int = Field(ge=0)
    destination_id: UUID = Field(foreign_key="destination.id")
    featured_image: Optional[str]
    gallery_images: Optional[str]  # JSON array of image URLs
    is_featured: bool = Field(default=False)
    is_active: bool = Field(default=True)
    highlights: Optional[str]
    itinerary: Optional[str]
    inclusions: Optional[str]
    exclusions: Optional[str]
    terms_conditions: Optional[str]
    max_group_size: Optional[int]
    available_from: Optional[date]
    available_until: Optional[date]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 📅 **Booking Model** (`src/models/booking.py`)
```python
class Booking(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    user_id: UUID = Field(foreign_key="user.id")
    package_id: UUID = Field(foreign_key="package.id")
    total_amount: float = Field(ge=0)
    discount_amount: float = Field(default=0, ge=0)
    final_amount: float = Field(ge=0)
    number_of_people: int = Field(ge=1)
    travel_date: date
    promo_code_id: Optional[UUID] = Field(foreign_key="promocode.id")
    payment_status: str = Field(default="pending")  # pending, completed, failed
    booking_status: str = Field(default="confirmed")  # confirmed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 🌍 **Destination Model** (`src/models/destination.py`)
```python
class Destination(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    name: str = Field(max_length=100)
    country: str = Field(max_length=100)
    city: str = Field(max_length=100)
    description: Optional[str]
    featured_image: Optional[str]
    is_popular: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 🎫 **Promo Code Model** (`src/models/promo_code.py`)
```python
class PromoCode(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    code: str = Field(unique=True, index=True, max_length=50)
    discount_type: str  # "percentage" or "fixed"
    discount_value: float = Field(ge=0)
    usage_limit: Optional[int] = Field(ge=0)
    used_count: int = Field(default=0, ge=0)
    valid_from: date
    valid_until: date
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 📝 **Blog Model** (`src/models/blog.py`)
```python
class Blog(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    title: str = Field(max_length=200)
    content: str
    excerpt: Optional[str] = Field(max_length=500)
    featured_image: Optional[str]
    is_published: bool = Field(default=False)
    author_id: UUID = Field(foreign_key="admin.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime]
```

#### 🔑 **Admin Model** (`src/admin/models.py`)
```python
class Admin(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    username: str = Field(unique=True, index=True, max_length=50)
    email: str = Field(unique=True, index=True)
    full_name: str = Field(max_length=100)
    password_hash: str
    role: str = Field(default="admin")  # admin, super_admin
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime]
```

### 🔄 Database Migrations

Managed by **Alembic** for version control:

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration  
alembic downgrade -1

# View migration history
alembic history
```

### 🎯 Key Database Features

- **UUID Primary Keys:** Enhanced security and distributed system compatibility
- **Automatic Timestamps:** Created/updated tracking for all models
- **Foreign Key Relationships:** Proper relational data integrity
- **Indexes:** Optimized queries on frequently searched fields
- **Type Safety:** SQLModel ensures runtime and static type checking
- **Validation:** Pydantic constraints for data validation
- **Async Support:** Full async/await database operations

---

## 🧪 Development & Testing

### 🔧 Development Workflow

#### Backend Development
```bash
cd backend

# Activate virtual environment
env\Scripts\Activate.ps1  # Windows PowerShell
# or
source env/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server with hot reload
python main.py

# Run with specific settings
uvicorn src:app --reload --port 8000 --host 0.0.0.0

# Run admin server (alternative)
python admin_server.py
```

#### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### 🧪 Testing

#### Backend Testing
```bash
cd backend

# Run all tests
python -m pytest

# Run tests with coverage
python -m pytest --cov=src

# Run specific test file
python -m pytest tests/test_auth.py

# Run tests with verbose output
python -m pytest -v
```

#### Frontend Testing
```bash
cd frontend

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### 📊 Code Quality & Standards

#### Backend Code Quality
```bash
cd backend

# Format code with Black
black src/

# Sort imports
isort src/

# Lint with flake8
flake8 src/

# Type checking with mypy
mypy src/

# Security scanning
bandit -r src/
```

#### Frontend Code Quality
```bash
cd frontend

# Lint TypeScript/JavaScript
npm run lint

# Fix linting issues
npm run lint:fix

# Format with Prettier
npm run format

# Type checking
npm run type-check

# Check bundle size
npm run analyze
```

### 🗄️ Database Management

#### Migration Commands
```bash
cd backend

# Create new migration (auto-generate from model changes)
alembic revision --autogenerate -m "Add new column to user table"

# Create empty migration (manual)
alembic revision -m "Custom migration"

# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade +1

# Rollback last migration
alembic downgrade -1

# Rollback to specific migration
alembic downgrade revision_id

# View migration history
alembic history

# Check current migration status
alembic current

# View SQL for migration (without executing)
alembic upgrade head --sql
```

#### Database Utilities
```bash
# Create default admin user
python scripts/create_default_admin.py

# Reset database (careful!)
alembic downgrade base
alembic upgrade head

# Backup database
pg_dump vistavoyage > backup.sql

# Restore database
psql vistavoyage < backup.sql
```

### 🔍 Debugging & Monitoring

#### Backend Debugging
```bash
# Enable debug mode
export DEBUG=True

# View detailed logs
python main.py --log-level debug

# Check database connections
python -c "from src.db.main import test_connection; test_connection()"

# Test Redis connection
redis-cli ping
```

#### Frontend Debugging
```bash
# Development with debugging
npm run dev

# Check API connections
npm run debug-api

# Analyze bundle
npm run analyze

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 🏗️ Build & Deployment Preparation

#### Production Build Testing
```bash
# Backend production test
cd backend
pip install gunicorn
gunicorn src:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Frontend production build
cd frontend
npm run build
npm start
```

#### Environment Validation
```bash
# Validate environment variables
python scripts/validate_env.py

# Test all API endpoints
python scripts/test_endpoints.py

# Check database schema
alembic check
```

---

## 🛠️ Contributing

We welcome contributions to VistaVoyage! Please follow these guidelines:

### 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/VistaVoyage.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Set up** development environment (see Getting Started section)
5. **Make** your changes
6. **Test** your changes thoroughly
7. **Commit** your changes: `git commit -m 'Add amazing feature'`
8. **Push** to your branch: `git push origin feature/amazing-feature`
9. **Open** a pull request

### 📋 Development Guidelines

#### Code Standards
- **Backend (Python):**
  - Follow PEP 8 style guidelines
  - Use type hints for all functions and methods
  - Write docstrings for modules, classes, and functions
  - Use meaningful variable and function names
  - Follow SQLModel patterns for database operations

- **Frontend (TypeScript/React):**
  - Follow TypeScript best practices
  - Use meaningful component and variable names
  - Implement proper error handling
  - Follow React hooks best practices
  - Use ShadCN UI components consistently

#### Commit Message Convention
```
type(scope): description

Examples:
feat(auth): add password reset functionality
fix(booking): resolve payment validation issue
docs(readme): update installation instructions
style(ui): improve button component styling
refactor(api): optimize database queries
test(booking): add unit tests for booking service
```

#### Branch Naming Convention
```
feature/feature-name      # New features
bugfix/bug-description    # Bug fixes
hotfix/critical-fix       # Critical fixes
docs/documentation-update # Documentation updates
refactor/code-improvement # Code refactoring
```

### 🧪 Testing Requirements

#### Before Submitting PR
- [ ] All existing tests pass
- [ ] New features include appropriate tests
- [ ] Code follows established patterns
- [ ] No TypeScript/Python type errors
- [ ] API endpoints are documented
- [ ] UI changes are responsive

#### Test Commands
```bash
# Backend tests
cd backend
python -m pytest
flake8 src/
black --check src/

# Frontend tests  
cd frontend
npm run lint
npm run type-check
npm run test
```

### 📝 Pull Request Process

1. **Update Documentation** - Update README.md if needed
2. **Add Tests** - Include tests for new functionality
3. **Follow Code Style** - Ensure code follows project conventions
4. **Describe Changes** - Provide clear PR description
5. **Request Review** - Tag relevant maintainers for review

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### 🐛 Issue Reports

#### Bug Reports
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

#### Feature Requests
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Alternative solutions considered

**Additional context**
Any other context or screenshots
```

### 🏗️ Architecture Decisions

When making significant changes:
- **Discuss** major changes in issues first
- **Follow** existing architectural patterns
- **Consider** performance implications
- **Maintain** backward compatibility when possible
- **Document** new patterns and conventions

### 📚 Resources

- **Backend:** [FastAPI Documentation](https://fastapi.tiangolo.com/)
- **Frontend:** [Next.js Documentation](https://nextjs.org/docs)
- **Database:** [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- **UI Components:** [ShadCN/UI Documentation](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## � Docker Setup (Optional)

For a containerized development environment:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

---

## 📊 Performance & Scalability

### 🚀 Performance Optimizations

#### Backend Performance
- **Async/Await:** Full asynchronous operation support with FastAPI and AsyncPG
- **Database Connection Pooling:** Optimized PostgreSQL connections with SQLModel
- **Redis Caching:** Session management and frequently accessed data caching
- **Query Optimization:** Proper indexing and efficient SQLModel queries
- **Response Compression:** Automatic gzip compression for API responses
- **Pagination:** Efficient data loading with limit/offset pagination

#### Frontend Performance
- **Next.js 15 App Router:** Latest routing system with optimal performance
- **Static Generation:** Pre-built pages for better load times
- **Image Optimization:** Next.js automatic image optimization and lazy loading
- **Code Splitting:** Automatic route-based code splitting
- **Bundle Optimization:** Tree-shaking and dead code elimination
- **Caching Strategy:** Efficient API response caching and state management

### 📈 Scalability Features

#### Horizontal Scaling Ready
- **Stateless Authentication:** JWT tokens enable multi-server deployment
- **Database Connection Management:** Async connection pools for high concurrency
- **File Storage:** Supabase integration for scalable file management
- **API Design:** RESTful APIs designed for load balancer distribution
- **Session Management:** Redis-based sessions support multiple application instances

#### Monitoring & Analytics
- **Structured Logging:** Comprehensive logging with Python logging module
- **Error Tracking:** Detailed error handling and reporting
- **Performance Metrics:** Built-in monitoring capabilities
- **Database Query Optimization:** Slow query identification and optimization
- **API Response Time Tracking:** Request/response timing and analytics

### 🔒 Security Implementation

#### Authentication & Authorization
- **Dual JWT System:** Separate tokens for users and administrators
- **Token Rotation:** Automatic token refresh for enhanced security
- **Password Security:** Bcrypt hashing with salt for password storage
- **Role-Based Access Control:** Granular permissions for different user types
- **Session Management:** Secure session handling with Redis

#### Data Protection
- **Input Validation:** Comprehensive validation with Pydantic schemas
- **SQL Injection Protection:** SQLModel/SQLAlchemy ORM prevents SQL injection
- **CORS Configuration:** Proper cross-origin resource sharing setup
- **Environment Variables:** Sensitive data managed through environment configuration
- **File Upload Security:** Secure file handling with Supabase storage

#### API Security
- **Rate Limiting:** Built-in protection against API abuse
- **Request Timeout:** Configurable timeouts prevent hanging requests
- **Error Handling:** Secure error responses without sensitive data exposure
- **HTTPS Ready:** SSL/TLS configuration support for production
- **Token Expiration:** Configurable token lifetimes for security

---

## 🔒 Security Features

- JWT authentication with secure token handling
- Role-based access control (RBAC)
- Input validation with Pydantic schemas
- SQL injection protection with SQLModel
- CORS configuration for cross-origin requests
- Environment-based configuration management

---

## 📈 Monitoring & Logging

- Structured logging with Python logging module
- Error tracking and monitoring ready
- Performance metrics collection
- Database query optimization

---

## 🚀 Deployment Guide

### 🌐 Production Environment Setup

#### Environment Variables for Production

**Backend Production (.env)**
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@prod-db-host:5432/vistavoyage

# Supabase Production Configuration
SUPABASE_URL=https://your-prod-project-ref.supabase.co
SUPABASE_KEY=your-production-supabase-key

# JWT Configuration - Use strong, unique keys
JWT_SECRET_KEY=your-ultra-secure-production-jwt-key-256-bits-minimum
JWT_ALGORITHM=HS256

# Admin JWT Configuration - Different from user JWT
ADMIN_JWT_SECRET_KEY=your-ultra-secure-admin-jwt-key-different-from-user
ADMIN_JWT_ALGORITHM=HS256
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Production Settings
ENVIRONMENT=production
DEBUG=False

# Admin Account
DEFAULT_ADMIN_USERNAME=prod_admin
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your-secure-admin-password
DEFAULT_ADMIN_FULL_NAME=Production Administrator
```

**Frontend Production (.env.local)**
```env
# Production API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_NAME="VistaVoyage"
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Production Settings
NODE_ENV=production
```

### 🐳 Docker Deployment

#### Docker Compose Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vistavoyage
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis Cache
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend API
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/vistavoyage
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  # Frontend Web App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:
```

#### Production Dockerfile Examples

**Backend Dockerfile (Dockerfile.prod)**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && gunicorn src:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"]
```

**Frontend Dockerfile (Dockerfile.prod)**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy and build application
COPY . .
RUN npm run build

# Start application
CMD ["npm", "start"]
```

### ☁️ Cloud Deployment Options

#### Vercel (Frontend) + Railway/Render (Backend)
```bash
# Frontend deployment to Vercel
npm install -g vercel
vercel --prod

# Backend deployment to Railway
railway login
railway init
railway up
```

#### AWS Deployment
```bash
# Using AWS EC2 + RDS + ElastiCache
# 1. Set up RDS PostgreSQL instance
# 2. Set up ElastiCache Redis cluster
# 3. Deploy to EC2 with Docker
# 4. Configure Application Load Balancer
# 5. Set up CloudFront for static assets
```

#### Google Cloud Platform
```bash
# Using Cloud Run + Cloud SQL + Memorystore
gcloud run deploy vistavoyage-backend --source .
gcloud run deploy vistavoyage-frontend --source .
```

### 🔧 Production Checklist

#### Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Use environment-specific JWT secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Enable database SSL connections
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

#### Performance Checklist
- [ ] Configure database connection pooling
- [ ] Set up Redis caching
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Optimize database indexes
- [ ] Set up health checks
- [ ] Configure auto-scaling
- [ ] Monitor resource usage

#### Operational Checklist
- [ ] Set up automated backups
- [ ] Configure log aggregation
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up CI/CD pipeline
- [ ] Document deployment process
- [ ] Create rollback procedures
- [ ] Set up staging environment

### 📈 Monitoring & Maintenance

#### Application Monitoring
```bash
# Health check endpoints
curl https://api.yourdomain.com/api/v1/auth/health
curl https://yourdomain.com/api/health

# Database monitoring
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bookings WHERE created_at > NOW() - INTERVAL '24 hours';

# Redis monitoring
redis-cli info memory
redis-cli info stats
```

#### Backup Strategy
```bash
# Automated database backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# File storage backups (Supabase handles this)
# Application configuration backups
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Contact

- **Issues:** Create an issue on GitHub
- **Documentation:** Check the `/docs` folder for detailed guides
- **Contributing:** See the CONTRIBUTING.md file

---

## 🎯 Roadmap & Future Enhancements

### 🚧 Current Development Phase
- ✅ **Core Platform:** User authentication, package management, booking system
- ✅ **Admin Dashboard:** Full CRUD operations for all entities
- ✅ **Professional UI:** Modern design with blue gradient theme
- ✅ **API Integration:** Complete REST API with dual authentication
- 🔄 **Payment Integration:** Stripe/PayPal gateway implementation (in progress)
- 🔄 **Testing Suite:** Comprehensive unit and integration tests (in progress)

### 📱 Phase 1: Mobile & Enhanced UX (Q2 2025)
- [ ] **Mobile App Development**
  - React Native app for iOS and Android
  - Offline booking capabilities
  - Push notifications for booking updates
  - Mobile-specific UI optimizations

- [ ] **Enhanced User Experience**
  - Advanced search with AI-powered recommendations
  - Interactive destination maps with heat zones
  - Virtual tour integration with 360° images
  - Real-time chat support with AI bot
  - Wishlist and favorites system with sharing

### 💳 Phase 2: Advanced Commerce (Q3 2025)
- [ ] **Payment Gateway Integration**
  - Stripe integration for card payments
  - PayPal support for alternative payments
  - Multi-currency support with live exchange rates
  - Installment payment options
  - Refund and cancellation automation

- [ ] **Advanced Booking Features**
  - Group booking management
  - Custom package builder
  - Dynamic pricing based on demand
  - Early bird and last-minute discounts
  - Booking modification and upgrade options

### 🌐 Phase 3: Global Expansion (Q4 2025)
- [ ] **Internationalization**
  - Multi-language support (Spanish, French, German, Japanese)
  - Localized content and currency
  - Regional destination recommendations
  - Cultural preference adaptations
  - Local payment method integration

- [ ] **Partner Integration**
  - Hotel booking API integration (Booking.com, Expedia)
  - Flight booking integration (Amadeus, Sabre)
  - Car rental services integration
  - Travel insurance partnerships
  - Local tour guide marketplace

### 📊 Phase 4: Intelligence & Analytics (Q1 2026)
- [ ] **AI & Machine Learning**
  - Personalized travel recommendations
  - Price prediction algorithms
  - Demand forecasting for dynamic pricing
  - Chatbot with natural language processing
  - Image recognition for automatic tagging

- [ ] **Advanced Analytics**
  - Customer behavior analytics dashboard
  - Revenue optimization insights
  - Market trend analysis
  - Predictive booking analytics
  - A/B testing framework for UI optimization

### 🤝 Phase 5: Social & Community (Q2 2026)
- [ ] **Social Features**
  - Travel community forum
  - User-generated content and reviews
  - Photo sharing and travel stories
  - Travel buddy matching system
  - Social media integration

- [ ] **Review & Rating System**
  - Comprehensive review system
  - Photo and video reviews
  - Verified traveler badges
  - Review moderation system
  - Incentive programs for reviews

### 🔒 Phase 6: Enterprise & B2B (Q3 2026)
- [ ] **Business Travel Solutions**
  - Corporate booking management
  - Expense reporting integration
  - Approval workflow systems
  - Corporate discount programs
  - Business travel analytics

- [ ] **Partner Dashboard**
  - Travel agent portal
  - Affiliate marketing system
  - White-label solutions
  - API for third-party integrations
  - Revenue sharing analytics

### 🚀 Long-term Vision (2027+)
- [ ] **Emerging Technologies**
  - AR/VR destination previews
  - Blockchain-based loyalty programs
  - IoT integration for smart travel
  - Voice-controlled booking assistant
  - Sustainable travel carbon footprint tracking

- [ ] **Global Platform**
  - Franchise opportunities
  - Local market partnerships
  - Regional customization
  - Global loyalty program
  - Cross-platform ecosystem

### 📈 Success Metrics & KPIs

#### Business Metrics
- Monthly Active Users (MAU)
- Booking Conversion Rate
- Average Order Value (AOV)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Net Promoter Score (NPS)

#### Technical Metrics
- API Response Time (<200ms)
- System Uptime (99.9%+)
- Page Load Speed (<3s)
- Mobile Performance Score (90+)
- Security Audit Score (A+)

### 🤝 Community Involvement

We're actively seeking contributions in:
- **Frontend Development:** React/Next.js expertise
- **Backend Development:** Python/FastAPI skills
- **Mobile Development:** React Native experience
- **UI/UX Design:** Modern web design principles
- **DevOps:** Docker, CI/CD, cloud deployment
- **Testing:** Automated testing frameworks
- **Documentation:** Technical writing skills

### 💡 Feature Suggestions

Have an idea for VistaVoyage? We'd love to hear it!
- Open an issue with the `enhancement` label
- Join our community discussions
- Contribute to our development roadmap
- Share your travel industry insights

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 VistaVoyage

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙋 Support & Contact

### 📞 Getting Help

- **📚 Documentation:** Check the inline code documentation and API docs
- **🐛 Issues:** Create an issue on GitHub for bugs or feature requests
- **💬 Discussions:** Join our GitHub discussions for questions and ideas
- **📧 Contact:** Reach out to the development team for enterprise inquiries

### 🔗 Links & Resources

- **🏠 Live Demo:** [VistaVoyage Demo](https://vistavoyage-demo.vercel.app) (Coming Soon)
- **📖 API Documentation:** [API Docs](http://localhost:8000/docs) (Development)
- **🎨 Design System:** [UI Components](https://ui.shadcn.com/)
- **⚡ Performance:** [Lighthouse Reports](https://developers.google.com/web/tools/lighthouse)

### 👥 Development Team

- **Project Lead:** [Abs-Futy7](https://github.com/Abs-Futy7)
- **Backend Development:** FastAPI, SQLModel, PostgreSQL
- **Frontend Development:** Next.js 15, React 19, TypeScript
- **UI/UX Design:** Tailwind CSS, ShadCN UI, Framer Motion

### 🤝 Community

- **GitHub Repository:** [VistaVoyage](https://github.com/Abs-Futy7/VistaVoyage)
- **Issues & Feature Requests:** [GitHub Issues](https://github.com/Abs-Futy7/VistaVoyage/issues)
- **Contributions:** [Contributing Guide](CONTRIBUTING.md)
- **Code of Conduct:** [Code of Conduct](CODE_OF_CONDUCT.md)

### 🌟 Acknowledgments

Special thanks to:
- **FastAPI** team for the amazing Python web framework
- **Next.js** team for the powerful React framework
- **ShadCN** for the beautiful UI component library
- **Tailwind CSS** for the utility-first CSS framework
- **Supabase** for the backend-as-a-service platform
- **PostgreSQL** for the robust database system
- **Redis** for the high-performance caching solution

### 📈 Project Statistics

![GitHub Stars](https://img.shields.io/github/stars/Abs-Futy7/VistaVoyage?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Abs-Futy7/VistaVoyage?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Abs-Futy7/VistaVoyage)
![GitHub PRs](https://img.shields.io/github/issues-pr/Abs-Futy7/VistaVoyage)
![License](https://img.shields.io/github/license/Abs-Futy7/VistaVoyage)

---

## 🌟 Show Your Support

If you found this project helpful, please consider:

- ⭐ **Starring** the repository
- 🍴 **Forking** the project
- 📢 **Sharing** with others
- 🐛 **Reporting** bugs
- 💡 **Suggesting** features
- 🤝 **Contributing** code

---

<div align="center">

**Built with ❤️ for travelers around the world**

*Making travel booking simple, secure, and beautiful*

</div>
