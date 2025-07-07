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
    city?: string;
    country?: string;
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
  trip_type_id: string;
  offer_id?: string;
  featured_image?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  available_from?: string;
  available_until?: string;
}

export interface PackageCreateRequest {
  title: string;
  description: string;
  price: number;
  duration_days: number;
  duration_nights: number;
  destination_id: string;
  trip_type_id: string;
  offer_id?: string;
  featured_image?: string;
  is_featured?: boolean;
  is_active?: boolean;
  available_from?: string;
  available_until?: string;
}

export interface PackageUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  duration_days?: number;
  duration_nights?: number;
  destination_id?: string;
  trip_type_id?: string;
  offer_id?: string;
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
  excerpt?: string;
  content: string;
  category: string;
  tags?: string[];
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
  tags?: string[];
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
  tags?: string[];
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
export interface AdminTripType {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripTypeCreateRequest {
  name: string;
  description?: string;
  category: string;
}

// Activity Management Types - Updated to match backend schema
export interface AdminActivity {
  id: string;
  name: string;
  description?: string;
  activity_type: string;
  duration_hours?: number;
  difficulty_level?: string;
  age_restriction?: string;
  featured_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreateRequest {
  name: string;
  description?: string;
  activity_type: string;
  duration_hours?: number;
  difficulty_level?: string;
  age_restriction?: string;
  featured_image?: string;
  is_active?: boolean;
}

export interface ActivityUpdateRequest {
  name?: string;
  description?: string;
  activity_type?: string;
  duration_hours?: number;
  difficulty_level?: number;
  age_restriction?: string;
  featured_image?: string;
  is_active?: boolean;
}

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
        
        formData.append('title', packageData.title);
        formData.append('description', packageData.description);
        formData.append('price', packageData.price.toString());
        formData.append('duration_days', packageData.duration_days.toString());
        formData.append('duration_nights', packageData.duration_nights.toString());
        formData.append('destination_id', packageData.destination_id);
        formData.append('trip_type_id', packageData.trip_type_id);
        formData.append('is_featured', packageData.is_featured?.toString() || 'false');
        formData.append('is_active', packageData.is_active?.toString() || 'true');
        if (packageData.offer_id) formData.append('offer_id', packageData.offer_id);
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
        if (packageData.trip_type_id) formData.append('trip_type_id', packageData.trip_type_id);
        if (packageData.offer_id !== undefined) {
          // Handle offer_id specially - empty string should be sent as empty string, not null
          formData.append('offer_id', packageData.offer_id || '');
        }
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
      if (packageData.trip_type_id) formData.append('trip_type_id', packageData.trip_type_id);
      if (packageData.offer_id !== undefined) {
        formData.append('offer_id', packageData.offer_id || '');
      }
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
        throw new Error('Failed to delete package');
      }
    } catch (error: any) {
      console.error('Delete package error:', error);
      throw error;
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
      
      if (blogData.tags) {
        formData.append('tags', blogData.tags.join(','));
      }
      
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
      
      if (blogData.tags !== undefined) {
        formData.append('tags', blogData.tags.join(','));
      }
      
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

  // Trip Type Management Methods
  async getTripTypes(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<AdminTripType>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await apiClient.get<PaginatedResponse<AdminTripType>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.TRIP_TYPES}?${params}`
      );

      if (response.success && response.data) {
        // Ensure we return the full paginated response structure
        const paginatedResponse: PaginatedResponse<AdminTripType> = {
          trip_types: response.data.trip_types || [],
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total_pages: response.data.total_pages || response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
        };
        
        return paginatedResponse;
      }

      throw new Error('Failed to fetch trip types');
    } catch (error: any) {
      console.error('Get trip types error:', error);
      throw error;
    }
  }

  async createTripType(tripTypeData: TripTypeCreateRequest): Promise<AdminTripType> {
    try {
      const formData = new FormData();
      formData.append('name', tripTypeData.name);
      formData.append('category', tripTypeData.category);
      
      if (tripTypeData.description) formData.append('description', tripTypeData.description);

      const response = await apiClient.postFormData<AdminTripType>(
        API_CONFIG.ENDPOINTS.ADMIN.TRIP_TYPE_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create trip type');
    } catch (error: any) {
      console.error('Create trip type error:', error);
      throw error;
    }
  }

  async updateTripType(tripTypeId: string, tripTypeData: Partial<TripTypeCreateRequest>): Promise<AdminTripType> {
    try {
      const formData = new FormData();
      
      if (tripTypeData.name) formData.append('name', tripTypeData.name);
      if (tripTypeData.category) formData.append('category', tripTypeData.category);
      if (tripTypeData.description) formData.append('description', tripTypeData.description);

      const response = await apiClient.putFormData<AdminTripType>(
        API_CONFIG.ENDPOINTS.ADMIN.TRIP_TYPE_UPDATE(tripTypeId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update trip type');
    } catch (error: any) {
      console.error('Update trip type error:', error);
      throw error;
    }
  }

  async deleteTripType(tripTypeId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.TRIP_TYPE_DELETE(tripTypeId)
      );

      if (!response.success) {
        throw new Error('Failed to delete trip type');
      }
    } catch (error: any) {
      console.error('Delete trip type error:', error);
      throw error;
    }
  }

  // Activity Management Methods
  async getActivities(page: number = 1, limit: number = 10, search?: string, activityType?: string): Promise<PaginatedResponse<AdminActivity>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(activityType && { activity_type: activityType })
      });

      const response = await apiClient.get<PaginatedResponse<AdminActivity>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.ACTIVITIES}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch activities');
    } catch (error: any) {
      console.error('Get activities error:', error);
      throw error;
    }
  }

  async createActivity(activityData: ActivityCreateRequest, featuredImage?: File): Promise<AdminActivity> {
    try {
      const formData = new FormData();
      formData.append('name', activityData.name);
      formData.append('activity_type', activityData.activity_type);
      formData.append('is_active', activityData.is_active?.toString() || 'true');
      
      if (activityData.description) formData.append('description', activityData.description);
      if (activityData.duration_hours) formData.append('duration_hours', activityData.duration_hours.toString());
      if (activityData.difficulty_level) formData.append('difficulty_level', activityData.difficulty_level.toString());
      if (activityData.age_restriction) formData.append('age_restriction', activityData.age_restriction);
      if (featuredImage) formData.append('featured_image', featuredImage);

      const response = await apiClient.postFormData<AdminActivity>(
        API_CONFIG.ENDPOINTS.ADMIN.ACTIVITY_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create activity');
    } catch (error: any) {
      console.error('Create activity error:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, activityData: ActivityUpdateRequest, featuredImage?: File): Promise<AdminActivity> {
    try {
      const formData = new FormData();
      
      if (activityData.name) formData.append('name', activityData.name);
      if (activityData.activity_type) formData.append('activity_type', activityData.activity_type);
      if (activityData.description) formData.append('description', activityData.description);
      if (activityData.duration_hours) formData.append('duration_hours', activityData.duration_hours.toString());
      if (activityData.difficulty_level) formData.append('difficulty_level', activityData.difficulty_level.toString());
      if (activityData.age_restriction) formData.append('age_restriction', activityData.age_restriction);
      if (activityData.is_active !== undefined) formData.append('is_active', activityData.is_active.toString());
      if (featuredImage) formData.append('featured_image', featuredImage);

      const response = await apiClient.putFormData<AdminActivity>(
        API_CONFIG.ENDPOINTS.ADMIN.ACTIVITY_UPDATE(activityId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update activity');
    } catch (error: any) {
      console.error('Update activity error:', error);
      throw error;
    }
  }

  async getActivityDetails(activityId: string) {
    const res = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.ACTIVITY_DETAILS(activityId));
    if (res.success && res.data) return res.data;
    throw new Error('Failed to fetch activity details');
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.ACTIVITY_DELETE(activityId)
      );

      if (!response.success) {
        throw new Error('Failed to delete activity');
      }
    } catch (error: any) {
      console.error('Delete activity error:', error);
      throw error;
    }
  }

  // Offer Management Methods
  async getOffers(page: number = 1, limit: number = 10, search?: string, offerType?: string, isActive?: boolean): Promise<PaginatedResponse<AdminOffer>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(offerType && { offer_type: offerType }),
        ...(isActive !== undefined && { is_active: isActive.toString() })
      });

      const response = await apiClient.get<PaginatedResponse<AdminOffer>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.OFFERS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch offers');
    } catch (error: any) {
      console.error('Get offers error:', error);
      throw error;
    }
  }

  async createOffer(offerData: OfferCreateRequest): Promise<AdminOffer> {
    try {
      const formData = new FormData();
      formData.append('title', offerData.title);
      formData.append('description', offerData.description);
      formData.append('valid_from', offerData.valid_from);
      formData.append('valid_until', offerData.valid_until);
      formData.append('is_active', offerData.is_active?.toString() || 'true');
      
      if (offerData.discount_percentage !== undefined) formData.append('discount_percentage', offerData.discount_percentage.toString());
      if (offerData.discount_amount !== undefined) formData.append('discount_amount', offerData.discount_amount.toString());
      if (offerData.max_usage_per_user !== undefined) formData.append('max_usage_per_user', offerData.max_usage_per_user.toString());
      if (offerData.total_usage_limit !== undefined) formData.append('total_usage_limit', offerData.total_usage_limit.toString());

      const response = await apiClient.postFormData<AdminOffer>(
        API_CONFIG.ENDPOINTS.ADMIN.OFFER_CREATE,
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create offer');
    } catch (error: any) {
      console.error('Create offer error:', error);
      throw error;
    }
  }

  async updateOffer(offerId: string, offerData: OfferUpdateRequest): Promise<AdminOffer> {
    try {
      const formData = new FormData();
      
      if (offerData.title) formData.append('title', offerData.title);
      if (offerData.description) formData.append('description', offerData.description);
      if (offerData.valid_from) formData.append('valid_from', offerData.valid_from);
      if (offerData.valid_until) formData.append('valid_until', offerData.valid_until);
      if (offerData.discount_percentage !== undefined) formData.append('discount_percentage', offerData.discount_percentage.toString());
      if (offerData.discount_amount !== undefined) formData.append('discount_amount', offerData.discount_amount.toString());
      if (offerData.max_usage_per_user !== undefined) formData.append('max_usage_per_user', offerData.max_usage_per_user.toString());
      if (offerData.total_usage_limit !== undefined) formData.append('total_usage_limit', offerData.total_usage_limit.toString());
      if (offerData.is_active !== undefined) formData.append('is_active', offerData.is_active.toString());

      const response = await apiClient.putFormData<AdminOffer>(
        API_CONFIG.ENDPOINTS.ADMIN.OFFER_UPDATE(offerId),
        formData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update offer');
    } catch (error: any) {
      console.error('Update offer error:', error);
      throw error;
    }
  }

  async toggleOfferActiveStatus(offerId: string): Promise<{ message: string; is_active: boolean }> {
    try {
      const response = await apiClient.patch<{ message: string; is_active: boolean }>(
        API_CONFIG.ENDPOINTS.ADMIN.OFFER_TOGGLE_ACTIVE(offerId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to toggle offer status');
    } catch (error: any) {
      console.error('Toggle offer status error:', error);
      throw error;
    }
  }

  async deleteOffer(offerId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.OFFER_DELETE(offerId)
      );

      if (!response.success) {
        throw new Error('Failed to delete offer');
      }
    } catch (error: any) {
      console.error('Delete offer error:', error);
      throw error;
    }
  }

  // Promo Code Management Methods
  async getPromoCodes(page: number = 1, limit: number = 10, search?: string, isActive?: boolean): Promise<PaginatedResponse<AdminPromoCode>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AdminPromoCode>>(
        API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODES
      );

      if (response.success && response.data) {
        // Handle different response structures
        let promoCodesArray: AdminPromoCode[] = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          promoCodesArray = response.data;
        } else if (response.data.promo_codes && Array.isArray(response.data.promo_codes)) {
          // If response.data has promo_codes property
          promoCodesArray = response.data.promo_codes;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If response.data has data property
          promoCodesArray = response.data.data;
        }
        
        let filteredData = promoCodesArray;
        
        // Apply client-side filtering if search or isActive is provided
        if (search) {
          filteredData = filteredData.filter(promoCode => 
            promoCode.code.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (isActive !== undefined) {
          filteredData = filteredData.filter(promoCode => promoCode.is_active === isActive);
        }
        
        // Apply client-side pagination
        const total = filteredData.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return {
          promo_codes: paginatedData,
          total,
          page,
          limit,
          totalPages
        };
      }

      throw new Error('Failed to fetch promo codes');
    } catch (error: any) {
      console.error('Get promo codes error:', error);
      throw error;
    }
  }

  async createPromoCode(promoCodeData: PromoCodeCreateRequest): Promise<AdminPromoCode> {
    try {
      // Pre-flight validation to catch issues before sending to backend
      console.log('Pre-flight validation for promo code creation...');
      
      // Validate required fields
      if (!promoCodeData.code || promoCodeData.code.trim() === '') {
        throw new Error('Promo code is required and cannot be empty');
      }
      
      if (!promoCodeData.discount_type) {
        throw new Error('Discount type is required');
      }
      
      if (!promoCodeData.discount_value || promoCodeData.discount_value <= 0) {
        throw new Error('Discount value is required and must be greater than 0');
      }
      
      if (!promoCodeData.start_date) {
        throw new Error('Start date is required');
      }
      
      if (!promoCodeData.expiry_date) {
        throw new Error('Expiry date is required');
      }
      
      // Validate offer_id if provided (now optional)
      if (promoCodeData.offer_id && promoCodeData.offer_id.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(promoCodeData.offer_id)) {
          throw new Error(`Offer ID "${promoCodeData.offer_id}" is not a valid UUID format`);
        }
      }
      
      // Validate usage_limit if provided
      if (promoCodeData.usage_limit !== undefined && promoCodeData.usage_limit !== null) {
        if (promoCodeData.usage_limit < 1) {
          throw new Error('Usage limit must be at least 1');
        }
        if (!Number.isInteger(promoCodeData.usage_limit)) {
          throw new Error('Usage limit must be an integer');
        }
      }
      
      // Validate code format (basic validation)
      if (promoCodeData.code.length > 50) {
        throw new Error('Promo code cannot be longer than 50 characters');
      }
      
      // Validate date logic
      const startDate = new Date(promoCodeData.start_date);
      const expiryDate = new Date(promoCodeData.expiry_date);
      
      if (expiryDate <= startDate) {
        throw new Error('Expiry date must be after start date');
      }
      
      console.log('Pre-flight validation passed');

      // Prepare JSON payload to match new backend schema
      const payload = {
        code: promoCodeData.code.trim().toUpperCase(),
        description: promoCodeData.description || '',
        discount_type: promoCodeData.discount_type,
        discount_value: promoCodeData.discount_value,
        minimum_amount: promoCodeData.minimum_amount || null,
        maximum_discount: promoCodeData.maximum_discount || null,
        start_date: promoCodeData.start_date,
        expiry_date: promoCodeData.expiry_date,
        usage_limit: promoCodeData.usage_limit || null,
        is_active: promoCodeData.is_active !== undefined ? promoCodeData.is_active : true,
        offer_id: promoCodeData.offer_id || null
      };
      
      console.log('Sending JSON payload for promo code creation:', payload);

      const response = await apiClient.post<AdminPromoCode>(
        API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_CREATE,
        payload
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create promo code');
    } catch (error: any) {
      console.error('Create promo code error:', error);
      // Log more details about the error for 422 validation errors
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Handle 422 validation errors specifically
        if (error.response.status === 422) {
          console.error('422 Validation Error Details:');
          console.error('Request URL:', error.config?.url);
          console.error('Request method:', error.config?.method);
          console.error('Request headers:', error.config?.headers);
          
          // Try to extract validation details
          if (error.response.data && error.response.data.detail) {
            console.error('Validation details:', JSON.stringify(error.response.data.detail, null, 2));
            
            // If detail is an array (FastAPI validation errors)
            if (Array.isArray(error.response.data.detail)) {
              const validationErrors = error.response.data.detail.map((err: any) => 
                `${err.loc?.join('.')} : ${err.msg}`
              ).join(', ');
              throw new Error(`Validation error: ${validationErrors}`);
            } else if (typeof error.response.data.detail === 'string') {
              throw new Error(`Validation error: ${error.response.data.detail}`);
            }
          }
          
          throw new Error(`Validation error (422): ${JSON.stringify(error.response.data)}`);
        }
      }
      throw error;
    }
  }

  async updatePromoCode(promoCodeId: string, promoCodeData: PromoCodeUpdateRequest): Promise<AdminPromoCode> {
    try {
      // Validate offer_id if provided
      if (promoCodeData.offer_id && promoCodeData.offer_id.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(promoCodeData.offer_id)) {
          throw new Error(`Offer ID "${promoCodeData.offer_id}" is not a valid UUID format`);
        }
      }
      
      // Validate usage_limit if provided
      if (promoCodeData.usage_limit !== undefined && promoCodeData.usage_limit !== null) {
        if (promoCodeData.usage_limit < 1) {
          throw new Error('Usage limit must be at least 1');
        }
        if (!Number.isInteger(promoCodeData.usage_limit)) {
          throw new Error('Usage limit must be an integer');
        }
      }
      
      // Validate date logic if both dates are provided
      if (promoCodeData.start_date && promoCodeData.expiry_date) {
        const startDate = new Date(promoCodeData.start_date);
        const expiryDate = new Date(promoCodeData.expiry_date);
        
        if (expiryDate <= startDate) {
          throw new Error('Expiry date must be after start date');
        }
      }
      
      // Prepare JSON payload to match new backend schema
      const payload: any = {};
      
      if (promoCodeData.code !== undefined) {
        payload.code = promoCodeData.code.trim().toUpperCase();
      }
      if (promoCodeData.description !== undefined) {
        payload.description = promoCodeData.description;
      }
      if (promoCodeData.discount_type !== undefined) {
        payload.discount_type = promoCodeData.discount_type;
      }
      if (promoCodeData.discount_value !== undefined) {
        payload.discount_value = promoCodeData.discount_value;
      }
      if (promoCodeData.minimum_amount !== undefined) {
        payload.minimum_amount = promoCodeData.minimum_amount;
      }
      if (promoCodeData.maximum_discount !== undefined) {
        payload.maximum_discount = promoCodeData.maximum_discount;
      }
      if (promoCodeData.start_date !== undefined) {
        payload.start_date = promoCodeData.start_date;
      }
      if (promoCodeData.expiry_date !== undefined) {
        payload.expiry_date = promoCodeData.expiry_date;
      }
      if (promoCodeData.usage_limit !== undefined) {
        payload.usage_limit = promoCodeData.usage_limit;
      }
      if (promoCodeData.is_active !== undefined) {
        payload.is_active = promoCodeData.is_active;
      }
      if (promoCodeData.offer_id !== undefined) {
        payload.offer_id = promoCodeData.offer_id || null;
      }
      
      console.log('Sending JSON payload for promo code update:', payload);

      const response = await apiClient.put<AdminPromoCode>(
        API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_UPDATE(promoCodeId),
        payload
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to update promo code');
    } catch (error: any) {
      console.error('Update promo code error:', error);
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async togglePromoCodeActiveStatus(promoCodeId: string): Promise<{ message: string; is_active: boolean }> {
    try {
      const response = await apiClient.patch<{ message: string; is_active: boolean }>(
        API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_TOGGLE_ACTIVE(promoCodeId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to toggle promo code status');
    } catch (error: any) {
      console.error('Toggle promo code status error:', error);
      throw error;
    }
  }

  async deletePromoCode(promoCodeId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_DELETE(promoCodeId)
      );

      if (!response.success) {
        throw new Error('Failed to delete promo code');
      }
    } catch (error: any) {
      console.error('Delete promo code error:', error);
      throw error;
    }
  }

  // Storage Setup
  async setupStorage(): Promise<{ message: string; bucket: string }> {
    try {
      const response = await apiClient.post<{ message: string; bucket: string }>(
        API_CONFIG.ENDPOINTS.ADMIN.SETUP_STORAGE
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to setup storage');
    } catch (error: any) {
      console.error('Setup storage error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
