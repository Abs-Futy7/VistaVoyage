import { apiClient } from '../client';
import { API_CONFIG } from '../config';

// Admin specific types
export interface DashboardStats {
  totalUsers: number;
  totalPackages: number;
  totalBookings: number;
  totalBlogs: number;
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
  recentBookings: any[];
  recentUsers: any[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminPackage {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: string;
  isActive: boolean;
  bookingsCount: number;
  createdAt: string;
}

export interface AdminBlog {
  id: string;
  title: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
  excerpt?: string;
}

export interface AdminBooking {
  id: string;
  customerName: string;
  packageTitle: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  createdAt: string;
  travelDate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>(
        API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch dashboard stats');
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  // Users
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

  // Packages
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
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch packages');
    } catch (error: any) {
      console.error('Get packages error:', error);
      throw error;
    }
  }

  async createPackage(packageData: any): Promise<AdminPackage> {
    try {
      const response = await apiClient.post<AdminPackage>(
        API_CONFIG.ENDPOINTS.ADMIN.PACKAGE_CREATE,
        packageData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create package');
    } catch (error: any) {
      console.error('Create package error:', error);
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
      throw error;
    }
  }

  // Blogs
  async getBlogs(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<AdminBlog>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await apiClient.get<PaginatedResponse<AdminBlog>>(
        `${API_CONFIG.ENDPOINTS.ADMIN.BLOGS}?${params}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch blogs');
    } catch (error: any) {
      console.error('Get blogs error:', error);
      throw error;
    }
  }

  async createBlog(blogData: any): Promise<AdminBlog> {
    try {
      const response = await apiClient.post<AdminBlog>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_CREATE,
        blogData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create blog');
    } catch (error: any) {
      console.error('Create blog error:', error);
      throw error;
    }
  }

  async updateBlog(blogId: string, blogData: any): Promise<AdminBlog> {
    try {
      const response = await apiClient.put<AdminBlog>(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_UPDATE(blogId),
        blogData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update blog');
    } catch (error: any) {
      console.error('Update blog error:', error);
      throw error;
    }
  }

  async deleteBlog(blogId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        API_CONFIG.ENDPOINTS.ADMIN.BLOG_DELETE(blogId)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete blog');
      }
    } catch (error: any) {
      console.error('Delete blog error:', error);
      throw error;
    }
  }

  // Bookings
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

      throw new Error(response.message || 'Failed to fetch bookings');
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

      throw new Error(response.message || 'Failed to update booking status');
    } catch (error: any) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
