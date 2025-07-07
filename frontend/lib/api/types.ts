// Types for API requests and responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  city: string;
  country: string;
  phone: string;
  passport: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface User {
  uid: string;
  full_name: string;
  email: string;
  city: string;
  country: string;
  phone: string;
  passport: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserUpdateModel {
  full_name?: string;
  email?: string;
  city?: string;
  country?: string;
  phone?: string;
  passport?: string;
}

// Package types
export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  images: string[];
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  package: Package;
  bookingDate: string;
  travelDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  packageId: string;
  travelDate: string;
  numberOfPeople: number;
  promoCode?: string;
  promoCodeId?: string;
}

// Blog types
export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Destination types
export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

// Itinerary types
export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

// Admin types
export interface DashboardStats {
  totalUsers: number;
  totalPackages: number;
  totalBookings: number;
  totalBlogs: number;
  recentBookings: Booking[];
  recentUsers: User[];
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookingsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
  };
}

export interface CreatePackageData {
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  images: string[];
  highlights: string[];
  included: string[];
  itinerary: DayItinerary[];
  category: string;
  maxGroupSize: number;
  availableDates: string[];
}

export interface UpdatePackageData extends Partial<CreatePackageData> {}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  coverImage: string;
  tags: string[];
  category: string;
  publishedAt?: string;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
