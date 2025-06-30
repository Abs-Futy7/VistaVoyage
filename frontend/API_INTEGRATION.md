# VoyageVista Frontend - FastAPI Integration

This document explains how to connect your Next.js frontend with the FastAPI backend.

## 📁 Folder Structure

```
frontend/
├── lib/
│   └── api/
│       ├── client.ts          # HTTP client with auth & error handling
│       ├── config.ts          # API endpoints configuration
│       ├── types.ts           # TypeScript types for API
│       ├── index.ts           # Export barrel
│       └── services/
│           ├── auth.ts        # Authentication service
│           ├── packages.ts    # Package management service
│           └── bookings.ts    # Booking management service
├── hooks/
│   └── useAuth.ts            # Authentication hook
└── .env.local                # Environment variables
```

## 🚀 Setup Instructions

### 1. Environment Configuration

Create/update `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development settings
NODE_ENV=development
```

### 2. FastAPI Backend Requirements

Your FastAPI backend should have these endpoints:

#### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password

#### Package Endpoints
- `GET /packages` - Get all packages
- `GET /packages/{id}` - Get package by ID
- `GET /packages/popular` - Get popular packages
- `GET /packages/search` - Search packages

#### Booking Endpoints
- `POST /bookings` - Create booking
- `GET /users/bookings` - Get user bookings
- `GET /bookings/{id}` - Get booking by ID
- `POST /bookings/{id}/cancel` - Cancel booking

### 3. Expected API Response Format

All API responses should follow this format:

```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### 4. Authentication Flow

The frontend expects JWT tokens with this login response:

```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here", 
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "city": "New York",
      "country": "USA",
      "phoneNumber": "+1234567890",
      "passportNumber": "A12345678",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

## 🔧 Usage Examples

### Using the Authentication Hook

```tsx
"use client";
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Using API Services Directly

```tsx
import { packageService, bookingService } from '@/lib/api';

// Get all packages
const packages = await packageService.getAllPackages();

// Create a booking
const booking = await bookingService.createBooking({
  packageId: 'pkg_123',
  travelDate: '2025-07-01',
  numberOfPeople: 2
});
```

### Making Custom API Calls

```tsx
import { apiClient } from '@/lib/api';

// GET request
const response = await apiClient.get('/custom-endpoint');

// POST request with data
const response = await apiClient.post('/custom-endpoint', {
  key: 'value'
});
```

## 🔒 Security Features

- **Automatic token refresh** - Handles expired tokens seamlessly
- **Request timeout** - Prevents hanging requests (10s timeout)
- **Error handling** - Consistent error format across the app
- **Token storage** - Secure localStorage management
- **Auto-logout** - Clears tokens on auth failures

## 🚦 CORS Configuration

Make sure your FastAPI backend allows CORS from your frontend domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 FastAPI Backend Example

Here's a basic FastAPI endpoint structure:

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel

app = FastAPI()

class LoginRequest(BaseModel):
    email: str
    password: str

class ApiResponse(BaseModel):
    success: bool
    data: dict = None
    message: str = None

@app.post("/auth/login")
async def login(request: LoginRequest):
    # Your authentication logic here
    if valid_credentials(request.email, request.password):
        return ApiResponse(
            success=True,
            data={
                "access_token": "generated_jwt_token",
                "refresh_token": "generated_refresh_token",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": "user_id",
                    "name": "John Doe",
                    "email": request.email,
                    # ... other user fields
                }
            },
            message="Login successful"
        )
    else:
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "message": "Invalid credentials",
                "errors": ["Email or password is incorrect"]
            }
        )
```

## 🔄 Migration from Mock Data

The registration and login pages have been updated to use the real API. To migrate other components:

1. Replace localStorage calls with API service calls
2. Use the `useAuth` hook for authentication state
3. Handle loading and error states properly
4. Update data types to match the API response format

## 🐛 Troubleshooting

### Common Issues:

1. **CORS errors** - Check FastAPI CORS configuration
2. **401 Unauthorized** - Verify JWT token format and expiration
3. **Network errors** - Check if FastAPI server is running on correct port
4. **Type errors** - Ensure API response matches TypeScript types

### Debug Mode:

All API calls are logged to the console. Check browser dev tools for detailed error information.
