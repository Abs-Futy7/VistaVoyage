# 🌍 VistaVoyage — Full Stack Travel Booking Platform

A comprehensive travel booking platform built with modern technologies, featuring package management, booking system with promo codes, user authentication, and admin dashboard.

---

## 🧱 Tech Stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI |
| Backend  | FastAPI, SQLModel, Alembic, Pydantic                         |
| Database | PostgreSQL with UUID primary keys                            |
| Auth     | JWT Authentication with role-based access                    |
| UI       | Lucide Icons, Sonner Toasts, Radix UI Components             |

---

## 📁 Project Structure

```
VistaVoyage/
├── backend/
│   ├── src/
│   │   ├── admin/          # Admin routes and services
│   │   ├── auth/           # Authentication system
│   │   ├── db/             # Database configuration
│   │   ├── models/         # SQLModel database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic services
│   │   ├── user/           # User routes and services
│   │   └── utils/          # Utility functions
│   ├── alembic/            # Database migrations
│   ├── env/                # Python virtual environment
│   ├── main.py             # FastAPI application entry
│   ├── admin_server.py     # Admin server setup
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── app/                # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   ├── user/           # User dashboard pages
│   │   ├── packages/       # Package browsing pages
│   │   └── ...             # Other pages
│   ├── components/         # Reusable React components
│   │   ├── ui/             # ShadCN UI components
│   │   ├── auth/           # Authentication components
│   │   ├── admin/          # Admin-specific components
│   │   └── booking/        # Booking-related components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API services
│   │   └── api/            # API service layer
│   └── public/             # Static assets
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 13+** (database)
- **Docker** (for Redis container)
- **Git** (version control)

### 🔴 Redis Setup (Required)

The application requires Redis for caching and session management. Run Redis using Docker:

```bash
# Pull and run Redis container
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
git clone <repository-url>
cd VistaVoyage
```

### 2️⃣ Environment Setup

Create environment files for both frontend and backend:

**→ backend/.env**

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vistavoyage

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
ENVIRONMENT=development
DEBUG=True
```

**→ frontend/.env.local**

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME="VistaVoyage"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Backend Setup (FastAPI + SQLModel)

**📦 Navigate to backend and set up virtual environment:**

```bash
cd backend
python -m venv env
```

**🔧 Activate virtual environment:**

```bash
# Windows
env\Scripts\activate

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

**� Run database migrations:**

```bash
# Initialize Alembic (if not already done)
alembic upgrade head

# Create admin user (optional)
python scripts/create_default_admin.py
```

**🚀 Start the FastAPI development server:**

```bash
# Main server
python -m uvicorn main:app --reload --port 8000

# Or admin server
python admin_server.py
```

**✅ Backend running at:** http://localhost:8000

### 4️⃣ Frontend Setup (Next.js 14)

**📂 Navigate to frontend:**

```bash
cd ../frontend  # from backend directory
```

**📦 Install dependencies:**

```bash
npm install
# or
yarn install
```

**🚀 Start the development server:**

```bash
npm run dev
# or
yarn dev
```

**✅ Frontend running at:** http://localhost:3000

---

## 🔗 API Documentation

- **Backend API:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)
- **Admin API:** Separate admin routes with role-based access

### Authentication

The API uses JWT tokens for authentication:

```bash
# Login to get token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in requests
curl -X GET "http://localhost:8000/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 👥 User Roles & Features

### 🔧 Admin Features

- **Dashboard:** Analytics and system overview
- **Package Management:** Create, edit, delete travel packages
- **Booking Management:** View and manage all bookings
- **User Management:** Manage user accounts and roles
- **Promo Code Management:** Create and manage discount codes
- **Blog Management:** Create and manage travel blog posts

### 👤 User Features

- **Package Browsing:** Search and filter travel packages
- **Booking System:** Book packages with promo code support
- **Profile Management:** Update personal information
- **Booking History:** View and manage personal bookings
- **Payment Processing:** Secure payment handling
- **Wishlist:** Save favorite packages

### 🎯 Core Features

- **Authentication:** JWT-based secure login/register
- **Role-based Access:** Admin and user role separation
- **Responsive Design:** Mobile-first responsive UI
- **Real-time Updates:** Dynamic content updates
- **Search & Filtering:** Advanced package search
- **Promo Code System:** Discount validation and application

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users:** User accounts with role-based access
- **Packages:** Travel packages with pricing and details
- **Bookings:** Booking records with payment tracking
- **Promo Codes:** Discount codes with usage limits
- **Blogs:** Travel blog posts and content
- **Destinations:** Travel destinations and locations

All entities use UUID primary keys for better security and scalability.

---

## 🧪 Development & Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 src/
black src/

# Frontend linting
cd frontend
npm run lint
npm run type-check
```

### Database Migrations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 🛠️ Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a pull request

### Development Guidelines

- Follow TypeScript best practices for frontend
- Use Python type hints and follow PEP 8 for backend
- Write meaningful commit messages
- Add tests for new features
- Update documentation when needed

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

- **Database:** PostgreSQL with proper indexing
- **Caching:** Redis integration ready
- **API:** FastAPI with async/await support
- **Frontend:** Next.js with SSR/SSG optimization
- **Authentication:** Stateless JWT tokens

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

## 🚀 Deployment

### Production Checklist

- [ ] Set secure JWT secret keys
- [ ] Configure production database
- [ ] Set up environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Database backup strategy

### Environment Variables for Production

```env
# Production backend/.env
DATABASE_URL=postgresql://user:pass@prod-db:5432/vistavoyage

# Supabase Production Configuration
SUPABASE_URL=https://your-prod-project-ref.supabase.co
SUPABASE_ANON_KEY=your-production-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-supabase-service-role-key

JWT_SECRET_KEY=super-secure-production-key
ENVIRONMENT=production
DEBUG=False

# Production frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
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

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Review and rating system

---

**Built with ❤️ for travelers around the world**
