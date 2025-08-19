import { apiClient } from '../client';
import { API_CONFIG } from '../config';

// Dashboard Stats Interface - matching backend response
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPackages: number;
  activePackages: number;
  totalBookings: number;
  totalBlogs: number;
  publishedBlogs: number;
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookingsByStatus: {
    [key: string]: number;
  };
  recentBookings: Array<{
    id: string;
    customerName: string;
    packageId: string;
    status: string;
    totalAmount: number;
    guests: number;
    travelDate: string;
    bookingDate: string;
  }>;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  }>;
  recentBlogs: Array<{
    id: string;
    title: string;
    author: string;
    createdAt: string;
    status: string;
    category: string;
  }>;
}

// System Stats Interface
export interface SystemStats {
  users: { total: number; active: number };
  destinations: { total: number; active: number };
  trip_types: { total: number; active: number };
  activities: { total: number; active: number };
  packages: { total: number; active: number; featured: number };
  bookings: { total: number; pending: number; confirmed: number };
  blogs: { total: number; published: number; drafts: number };
  offers: { total: number; active: number };
  promo_codes: { total: number; active: number };
}

// User Management Types
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  isVerified?: boolean;
  bookingsCount?: number;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Package Management Types - Updated to match backend schema
export interface AdminPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_days: number;
  duration_nights: number;
  destination_id: string;
  featured_image?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  available_from?: string;
  available_until?: string;
  // --- Added fields for full backend compatibility ---
  image_gallery?: string[];
  images?: any[];
  details?: any;
  schedule?: any;
  destination_name?: string;
  highlights?: string;
  itinerary?: string;
}

// Package Create Request
export interface PackageCreateRequest {
  title: string;
  description: string;
  price: number;
  duration_days: number;
  duration_nights: number;
  destination_id: string;
  featured_image?: string;
  is_featured?: boolean;
  is_active?: boolean;
  available_from?: string;
  available_until?: string;
}

// Package Update Request
export interface PackageUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  duration_days?: number;
  duration_nights?: number;
  destination_id?: string;
  featured_image?: string;
  is_featured?: boolean;
  is_active?: boolean;
  
  // Detailed content fields
  highlights?: string;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  terms_conditions?: string;
  max_group_size?: number;
  min_age?: number;
  difficulty_level?: string;
  available_from?: string;
  available_until?: string;
}

// Blog Management Types - Updated to match backend schema
export interface AdminBlog {
  id: string;
  title: string;
  author_id: string;
  author_name?: string; // <-- Add this line
  excerpt?: string;
  content: string;
  category: string;
  // tags removed
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCreateRequest {
  title: string;
  author_id: string;
  excerpt?: string;
  content: string;
  category: string;
  // tags removed
  cover_image?: string;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
}

export interface BlogUpdateRequest {
  title?: string;
  author_id?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  // tags removed
  cover_image?: string;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
}

// Booking Management Types - Updated to match backend schema
export interface AdminBooking {
  id: string;
  package_id: string;
  user_id: string;
  promo_code_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded';
  total_amount: number;
  paid_amount: number;
  discount_amount: number;
  booking_date: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joined data
  packageTitle: string;
  packageDescription?: string;
  packagePrice: number;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    createdAt: string;
  };
}

export interface AdminBookingDetails extends AdminBooking {
  packageTitle: string;
  packageDescription?: string;
  packagePrice: number;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    dateOfBirth?: string | null;
    createdAt: string;
  };
}

// Destination Management Types - Updated to match backend schema
export interface AdminDestination {
  id: string;
  name: string;
  description?: string;
  country: string;
  city: string;
  best_time_to_visit?: string;
  timezone?: string;
  featured_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminDestinationDetail extends AdminDestination {
  total_packages: number;
  active_packages: number;
  featured_packages: number;
}

export interface DestinationCreateRequest {
  name: string;
  description?: string;
  country: string;
  city: string;
  best_time_to_visit?: string;
  timezone?: string;
  featured_image?: string;
  is_active?: boolean;
}

export interface DestinationUpdateRequest {
  name?: string;
  description?: string;
  country?: string;
  city?: string;
  best_time_to_visit?: string;
  timezone?: string;
  featured_image?: string;
  is_active?: boolean;
}

// Trip Type Management Types - Updated to match backend schema


// Offer Management Types - Updated to match backend schema
export interface AdminOffer {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: number;
  max_usage_per_user?: number;
  total_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfferCreateRequest {
  title: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: number;
  max_usage_per_user?: number;
  total_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}

export interface OfferUpdateRequest {
  title?: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  max_usage_per_user?: number;
  total_usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

// Promo Code Management Types - Updated to match backend schema
export interface AdminPromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  start_date: string;
  expiry_date: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Legacy fields for backward compatibility
  offer_id?: string;
  max_usage?: number;
  current_usage: number;
  
  // Computed fields
  remaining_uses?: number;
  is_valid: boolean;
  is_expired: boolean;
}

export interface PromoCodeCreateRequest {
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  start_date: string;
  expiry_date: string;
  usage_limit?: number;
  is_active?: boolean;
  offer_id?: string;
}

export interface PromoCodeUpdateRequest {
  code?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  minimum_amount?: number;
  maximum_discount?: number;
  start_date?: string;
  expiry_date?: string;
  usage_limit?: number;
  is_active?: boolean;
  offer_id?: string;
}

// Generic Paginated Response
export interface PaginatedResponse<T> {
  data?: T[];
  items?: T[];
  users?: T[];
  packages?: T[];
  blogs?: T[];
  bookings?: T[];
  destinations?: T[];
  trip_types?: T[];
  activities?: T[];
  offers?: T[];
  promo_codes?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  total_pages?: number; // Added to match API response
  pages?: number;
}

export class AdminService {
  // Helper method to extract data from paginated response
  private extractPaginatedData<T>(response: PaginatedResponse<T>): T[] {
    // Handle response with both data and items arrays
    return response.data || response.items || response.users || response.packages || response.blogs || response.bookings || response.destinations || response.trip_types || response.activities || response.offers || response.promo_codes || [];
  }

  // Helper method to get total pages count
  private getTotalPages(response: PaginatedResponse<any>): number {
    return response.totalPages || response.pages || Math.ceil(response.total / response.limit);
  }
  // Dashboard Methods
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>(
        API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch dashboard stats');
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await apiClient.get<SystemStats>(
        API_CONFIG.ENDPOINTS.ADMIN.SYSTEM_STATS
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch system stats');
    } catch (error: any) {
      console.error('System stats error:', error);
      throw error;
    }
  }

  // User Management Methods
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<AdminUser>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await apiClient.get<PaginatedResponse<AdminUser>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch users');
    } catch (error: any) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.patch<AdminUser>(
        API_CONFIG.ENDPOINTS.ADMIN.USER_TOGGLE_STATUS(userId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to toggle user status');
    } catch (error: any) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.USER_DELETE(userId)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Package Management Methods
  async getPackages(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<AdminPackage>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await apiClient.get<PaginatedResponse<AdminPackage>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.PACKAGES}?${params}`
      );

      if (response.success && response.data) {
        // Ensure we return the full paginated response structure
        const paginatedResponse: PaginatedResponse<AdminPackage> = {
          packages: response.data.packages || [],
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total_pages: response.data.total_pages || response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
        };
        
        return paginatedResponse;
      }

      throw new Error('Failed to fetch packages');
    } catch (error: any) {
      console.error('Get packages error:', error);
      throw error;
    }
  }

  async getPackageById(packageId: string): Promise<AdminPackage> {
    try {
      const response = await apiClient.get<AdminPackage>(
        `${API_CONFIG.ENDPOINTS.ADMIN.PACKAGES}/${packageId}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch package');
    } catch (error: any) {
      console.error('Get package by ID error:', error);
      throw error;
    }
  }

  async createPackage(packageData: PackageCreateRequest | FormData, featuredImage?: File): Promise<AdminPackage> {
    try {
      let formData: FormData;
      
      if (packageData instanceof FormData) {
        formData = packageData;
      } else {
        formData = new FormData();
        // Remove trip_type_id and offer_id from the input object before appending
        const { trip_type_id, offer_id, ...cleanData } = packageData as any;
        Object.entries(cleanData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof Blob) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        if (featuredImage) formData.append('featured_image', featuredImage);
      }

      console.log('Creating package with form data:', packageData);
      console.log('Featured image file:', featuredImage);

      const response = await apiClient.postFormData<AdminPackage>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create package');
    } catch (error: any) {
      console.error('Create package error:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Handle specific UUID error from backend
      if (error.message && error.message.includes('invalid UUID')) {
        throw {
          ...error,
          message: 'Backend configuration error: The system is generating invalid package IDs. Please contact the administrator.',
          errors: ['Package ID generation error - backend needs to be updated to generate proper UUIDs']
        };
      }
      
      throw error;
    }
  }

  async updatePackage(packageId: string, packageData: PackageUpdateRequest | FormData, featuredImage?: File): Promise<AdminPackage> {
    try {
      let formData: FormData;
      
      if (packageData instanceof FormData) {
        formData = packageData;
      } else {
        formData = new FormData();
        
        // Basic fields
        if (packageData.title) formData.append('title', packageData.title);
        if (packageData.description) formData.append('description', packageData.description);
        if (packageData.price) formData.append('price', packageData.price.toString());
        if (packageData.duration_days) formData.append('duration_days', packageData.duration_days.toString());
        if (packageData.duration_nights) formData.append('duration_nights', packageData.duration_nights.toString());
        if (packageData.destination_id) formData.append('destination_id', packageData.destination_id);
       
        if (packageData.is_featured !== undefined) formData.append('is_featured', packageData.is_featured.toString());
        if (packageData.is_active !== undefined) formData.append('is_active', packageData.is_active.toString());
        
        // Extended fields (need to handle any additional fields in packageData)
        const extendedFields = [
          'highlights', 'itinerary', 'inclusions', 'exclusions', 'terms_conditions',
          'max_group_size', 'min_age', 'difficulty_level', 'available_from', 'available_until'
        ];
        
        extendedFields.forEach(field => {
          if ((packageData as any)[field] !== undefined && (packageData as any)[field] !== null) {
            if (field === 'max_group_size' || field === 'min_age') {
              // Handle numeric fields
              formData.append(field, (packageData as any)[field].toString());
            } else {
              // Handle string and date fields
              formData.append(field, (packageData as any)[field].toString());
            }
          }
        });
        
        if (featuredImage) formData.append('featured_image', featuredImage);
      }

      const response = await apiClient.putFormData<AdminPackage>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_UPDATE(packageId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update package');
    } catch (error: any) {
      console.error('Update package error:', error);
      throw error;
    }
  }

  async updatePackageWithGallery(packageId: string, packageData: PackageUpdateRequest, featuredImage?: File, galleryImages?: File[]): Promise<AdminPackage> {
    try {
      const formData = new FormData();
      
      // Basic fields
      if (packageData.title) formData.append('title', packageData.title);
      if (packageData.description) formData.append('description', packageData.description);
      if (packageData.price) formData.append('price', packageData.price.toString());
      if (packageData.duration_days) formData.append('duration_days', packageData.duration_days.toString());
      if (packageData.duration_nights) formData.append('duration_nights', packageData.duration_nights.toString());
      if (packageData.destination_id) formData.append('destination_id', packageData.destination_id);
   
      
      if (packageData.is_featured !== undefined) formData.append('is_featured', packageData.is_featured.toString());
      if (packageData.is_active !== undefined) formData.append('is_active', packageData.is_active.toString());
      
      // Extended fields
      const extendedFields = [
        'highlights', 'itinerary', 'inclusions', 'exclusions', 'terms_conditions',
        'max_group_size', 'min_age', 'difficulty_level', 'available_from', 'available_until'
      ];
      
      extendedFields.forEach(field => {
        if ((packageData as any)[field] !== undefined && (packageData as any)[field] !== null) {
          if (field === 'max_group_size' || field === 'min_age') {
            formData.append(field, (packageData as any)[field].toString());
          } else {
            formData.append(field, (packageData as any)[field].toString());
          }
        }
      });
      
      // Add featured image if provided
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }
      
      // Add gallery images if provided
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((image, index) => {
          formData.append('gallery_images', image);
        });
        console.log(`Added ${galleryImages.length} gallery images to FormData`);
      }

      console.log('Sending FormData to backend with gallery images');
      const response = await apiClient.putFormData<AdminPackage>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_UPDATE(packageId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update package');
    } catch (error: any) {
      console.error('Update package with gallery error:', error);
      throw error;
    }
  }

  async togglePackageActiveStatus(packageId: string): Promise<{ message: string; is_active: boolean }> {
    try {
      const response = await apiClient.patch<{ message: string; is_active: boolean }>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_TOGGLE_ACTIVE(packageId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to toggle package status');
    } catch (error: any) {
      console.error('Toggle package status error:', error);
      throw error;
    }
  }

  async deletePackage(packageId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_DELETE(packageId)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete package');
      }
    } catch (error: any) {
      console.error('Delete package error:', error);
      // Extract the detailed error message from the backend response
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to delete package');
      }
    }
  }

  async uploadPackageImage(imageFile: File): Promise<{ image_url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.postFormData<{ image_url: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_UPLOAD_IMAGE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to upload package image');
    } catch (error: any) {
      console.error('Upload package image error:', error);
      throw error;
    }
  }

  // Blog Management Methods
  async getBlogs(page: number = 1, limit: number = 10, search?: string, category?: string): Promise<PaginatedResponse<AdminBlog>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category && { category })
      });

      const response = await apiClient.get<PaginatedResponse<AdminBlog>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.BLOGS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch blogs');
    } catch (error: any) {
      console.error('Get blogs error:', error);
      throw error;
    }
  }

  async createBlog(blogData: BlogCreateRequest, coverImage?: File): Promise<AdminBlog> {
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('author_id', blogData.author_id);
      formData.append('content', blogData.content);
      formData.append('category', blogData.category);
      formData.append('status', blogData.status || 'draft');
      formData.append('is_featured', blogData.is_featured?.toString() || 'false');
      
      if (blogData.excerpt) {
        formData.append('excerpt', blogData.excerpt);
      }
      
      // tags removed
      
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await apiClient.postFormData<AdminBlog>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create blog');
    } catch (error: any) {
      console.error('Create blog error:', error);
      throw error;
    }
  }

  async updateBlog(blogId: string, blogData: BlogUpdateRequest, coverImage?: File): Promise<AdminBlog> {
    try {
      const formData = new FormData();
      
      if (blogData.title !== undefined) formData.append('title', blogData.title);
      if (blogData.author_id !== undefined) formData.append('author_id', blogData.author_id);
      if (blogData.excerpt !== undefined) formData.append('excerpt', blogData.excerpt);
      if (blogData.content !== undefined) formData.append('content', blogData.content);
      if (blogData.category !== undefined) formData.append('category', blogData.category);
      if (blogData.status !== undefined) formData.append('status', blogData.status);
      if (blogData.is_featured !== undefined) formData.append('is_featured', blogData.is_featured.toString());
      
      // tags removed
      
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await apiClient.putFormData<AdminBlog>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_UPDATE(blogId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update blog');
    } catch (error: any) {
      console.error('Update blog error:', error);
      throw error;
    }
  }

  async toggleBlogPublishStatus(blogId: string): Promise<{ message: string; status: string }> {
    try {
      const response = await apiClient.patch<{ message: string; status: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_TOGGLE_PUBLISH(blogId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to toggle blog publish status');
    } catch (error: any) {
      console.error('Toggle blog publish status error:', error);
      throw error;
    }
  }

  async deleteBlog(blogId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_DELETE(blogId)
      );

      if (!response.success) {
        throw new Error('Failed to delete blog');
      }
    } catch (error: any) {
      console.error('Delete blog error:', error);
      throw error;
    }
  }

  async uploadBlogImage(imageFile: File): Promise<{ image_url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.postFormData<{ image_url: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_UPLOAD_IMAGE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to upload blog image');
    } catch (error: any) {
      console.error('Upload blog image error:', error);
      throw error;
    }
  }

  // Booking Management Methods
  async getBookings(page: number = 1, limit: number = 10, search?: string, status?: string): Promise<PaginatedResponse<AdminBooking>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await apiClient.get<PaginatedResponse<AdminBooking>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch bookings');
    } catch (error: any) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<AdminBooking> {
    try {
      const response = await apiClient.patch<AdminBooking>(
        API_CONFIG.ENDPOINTS.ADMIN.BOOKING_UPDATE_STATUS(bookingId),
        { status }
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update booking status');
    } catch (error: any) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  async getBookingDetails(bookingId: string): Promise<AdminBookingDetails> {
    try {
      const response = await apiClient.get<AdminBookingDetails>(
        API_CONFIG.ENDPOINTS.ADMIN.BOOKING_DETAILS(bookingId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch booking details');
    } catch (error: any) {
      console.error('Get booking details error:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.BOOKING_DELETE(bookingId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to delete booking');
    } catch (error: any) {
      console.error('Delete booking error:', error);
      throw error;
    }
  }

  // Destination Management Methods
  async getDestinations(page: number = 1, limit: number = 10, search?: string, country?: string): Promise<PaginatedResponse<AdminDestination>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(country && { country })
      });

      const response = await apiClient.get<PaginatedResponse<AdminDestination>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.DESTINATIONS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch destinations');
    } catch (error: any) {
      console.error('Get destinations error:', error);
      throw error;
    }
  }

  async getDestinationById(destinationId: string): Promise<AdminDestination> {
    try {
      const response = await apiClient.get<AdminDestination>(
        API_CONFIG.ENDPOINTS.ADMIN.DESTINATION_DETAILS(destinationId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch destination');
    } catch (error: any) {
      console.error('Get destination by ID error:', error);
      throw error;
    }
  }

  async getDestinationDetails(destinationId: string): Promise<AdminDestinationDetail> {
    try {
      const response = await apiClient.get<AdminDestinationDetail>(
        API_CONFIG.ENDPOINTS.ADMIN.DESTINATION_DETAILS_FULL(destinationId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch destination details');
    } catch (error: any) {
      console.error('Get destination details error:', error);
      throw error;
    }
  }

  async createDestination(destinationData: DestinationCreateRequest, featuredImage?: File): Promise<AdminDestination> {
    try {
      const formData = new FormData();
      formData.append('name', destinationData.name);
      formData.append('country', destinationData.country);
      formData.append('city', destinationData.city);
      formData.append('is_active', destinationData.is_active?.toString() || 'true');
      
      if (destinationData.description) formData.append('description', destinationData.description);
      if (destinationData.best_time_to_visit) formData.append('best_time_to_visit', destinationData.best_time_to_visit);
      if (destinationData.timezone) formData.append('timezone', destinationData.timezone);
      if (featuredImage) formData.append('featured_image', featuredImage);

      const response = await apiClient.postFormData<AdminDestination>(
        API_CONFIG.ENDPOINTS.ADMIN.DESTINATION_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create destination');
    } catch (error: any) {
      console.error('Create destination error:', error);
      throw error;
    }
  }

  async updateDestination(destinationId: string, destinationData: DestinationUpdateRequest, featuredImage?: File): Promise<AdminDestination> {
    try {
      const formData = new FormData();
      
      if (destinationData.name) formData.append('name', destinationData.name);
      if (destinationData.description) formData.append('description', destinationData.description);
      if (destinationData.country) formData.append('country', destinationData.country);
      if (destinationData.city) formData.append('city', destinationData.city);
      if (destinationData.best_time_to_visit) formData.append('best_time_to_visit', destinationData.best_time_to_visit);
      if (destinationData.timezone) formData.append('timezone', destinationData.timezone);
      if (destinationData.is_active !== undefined) formData.append('is_active', destinationData.is_active.toString());
      if (featuredImage) formData.append('featured_image', featuredImage);

      const response = await apiClient.putFormData<AdminDestination>(
        API_CONFIG.ENDPOINTS.ADMIN.DESTINATION_UPDATE(destinationId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update destination');
    } catch (error: any) {
      console.error('Update destination error:', error);
      throw error;
    }
  }

  async deleteDestination(destinationId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.DESTINATION_DELETE(destinationId)
      );

      if (!response.success) {
        throw new Error('Failed to delete destination');
      }
    } catch (error: any) {
      console.error('Delete destination error:', error);
      throw error;
    }
  }


}

// Export singleton instance
export const adminService = new AdminService();
