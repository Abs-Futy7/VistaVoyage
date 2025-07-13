
import { useState, useEffect, useCallback } from 'react';
import { adminAuthService, AdminModel } from '@/lib/api/services/admin-auth';
import { adminService } from '@/lib/api/services/admin';
import { AdminUser, AdminPackage, AdminBooking, AdminBlog, AdminDestination, DashboardStats, SystemStats } from '@/lib/api/services/admin';
import { toast } from 'sonner';

// Admin authentication and permissions hook
export const useAdmin = () => {
  const [admin, setAdmin] = useState<AdminModel | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Example login/logout/getCurrentAdmin/changePassword implementations would go here
  // ...existing code for login, logout, getCurrentAdmin, changePassword...

  // Check if admin has specific role
  const hasRole = (role: string) => {
    return admin?.role === role;
  };

  // Check if admin is super admin
  const isSuperAdmin = () => {
    return hasRole('super_admin');
  };

  // Check if admin can perform action
  const canPerformAction = (action: string) => {
    if (isSuperAdmin()) return true;
    // Define role-based permissions
    const permissions = {
      admin: [
        'view_dashboard',
        'manage_users',
        'manage_packages',
        'manage_blogs',
        'manage_bookings',
        'manage_destinations',
        'manage_promo_codes',
        'view_stats'
      ],
      moderator: [
        'view_dashboard',
        'manage_blogs',
        'manage_bookings',
        'view_stats'
      ],
      editor: [
        'view_dashboard',
        'manage_blogs',
        'view_stats'
      ]
    };
    const userRole = admin?.role || '';
    const allowedActions = permissions[userRole as keyof typeof permissions] || [];
    return allowedActions.includes(action);
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    login: () => {}, // placeholder
    logout: () => {}, // placeholder
    getCurrentAdmin: () => {}, // placeholder
    changePassword: () => {}, // placeholder
    hasRole,
    isSuperAdmin,
    canPerformAction,
  };
};

// Dashboard hook
export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [dashboardData, systemData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSystemStats()
      ]);
      setStats(dashboardData);
      setSystemStats(systemData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    systemStats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Users management hook
export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchUsers = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, limit, search);
      setUsers(response.users || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.totalPages || response.pages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      await fetchUsers(pagination.page, pagination.limit);
      toast.success('User status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      await fetchUsers(pagination.page, pagination.limit);
      toast.success('User deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    toggleUserStatus,
    deleteUser,
  };
};

// Packages management hook
export const useAdminPackages = () => {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchPackages = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      setLoading(true);
      console.log('Fetching packages...', { page, limit, search });
      
      const response = await adminService.getPackages(page, limit, search);
      console.log('Packages response:', response);
      
      // Handle different response formats - backend uses "packages"
      const packagesData = response.packages || response.data || [];
      console.log('Packages data:', packagesData, 'is array:', Array.isArray(packagesData));
      
      setPackages(Array.isArray(packagesData) ? packagesData : []);
      
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.total_pages || response.totalPages || response.pages || Math.ceil((response.total || 0) / limit)
      });
      setError(null);
    } catch (err: any) {
      console.error('Fetch packages error:', err);
      setError(err.message || 'Failed to fetch packages');
      setPackages([]); // Ensure packages is always an array
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const togglePackageStatus = async (packageId: string) => {
    try {
      await adminService.togglePackageActiveStatus(packageId);
      await fetchPackages(pagination.page, pagination.limit);
      toast.success('Package status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update package status');
    }
  };

  const deletePackage = async (packageId: string) => {
    try {
      await adminService.deletePackage(packageId);
      await fetchPackages(pagination.page, pagination.limit);
      toast.success('Package deleted successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to delete package');
      return false;
    }
  };

  const createPackage = async (packageData: any, featuredImage?: File) => {
    try {
      console.log('Hook: Creating package with data:', packageData);
      console.log('Hook: Featured image file:', featuredImage);
      await adminService.createPackage(packageData, featuredImage);
      await fetchPackages(pagination.page, pagination.limit);
      toast.success('Package created successfully');
      return true;
    } catch (err: any) {
      console.error('Hook: Create package error:', err);
      console.error('Hook: Error status:', err.status);
      console.error('Hook: Error errors:', err.errors);
      const errorMessage = err.errors && err.errors.length > 0 
        ? err.errors.join(', ') 
        : err.message || 'Failed to create package';
      toast.error(`Failed to create package: ${errorMessage}`);
      return false;
    }
  };

  const updatePackage = async (packageId: string, packageData: any, featuredImage?: File) => {
    try {
      console.log('Hook: Updating package with data:', packageData);
      console.log('Hook: Featured image file:', featuredImage);
      await adminService.updatePackage(packageId, packageData, featuredImage);
      await fetchPackages(pagination.page, pagination.limit);
      toast.success('Package updated successfully');
      return true;
    } catch (err: any) {
      console.error('Hook: Update package error:', err);
      toast.error('Failed to update package');
      return false;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const refetch = () => fetchPackages(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchPackages(pagination.page, pagination.limit, term);
  };

  return {
    packages,
    loading,
    error,
    pagination,
    fetchPackages,
    togglePackageStatus,
    deletePackage,
    createPackage,
    updatePackage,
    search,
    searchTerm,
    refetch,
  };
};

// Blogs management hook
export const useAdminBlogs = () => {
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBlogs = async (page: number = 1, limit: number = 10, search?: string, category?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getBlogs(page, limit, search, category);
      setBlogs(response.blogs || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.totalPages || response.pages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blogs');
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlogStatus = async (blogId: string) => {
    try {
      await adminService.toggleBlogPublishStatus(blogId);
      await fetchBlogs(pagination.page, pagination.limit);
      toast.success('Blog status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update blog status');
    }
  };

  const deleteBlog = async (blogId: string) => {
    try {
      await adminService.deleteBlog(blogId);
      await fetchBlogs(pagination.page, pagination.limit);
      toast.success('Blog deleted successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to delete blog');
      return false;
    }
  };

  const createBlog = async (blogData: any) => {
    try {
      await adminService.createBlog(blogData);
      await fetchBlogs(pagination.page, pagination.limit);
      toast.success('Blog created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create blog');
      return false;
    }
  };

  const updateBlog = async (blogId: string, blogData: any) => {
    try {
      await adminService.updateBlog(blogId, blogData);
      await fetchBlogs(pagination.page, pagination.limit);
      toast.success('Blog updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update blog');
      return false;
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const refetch = () => fetchBlogs(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchBlogs(pagination.page, pagination.limit, term);
  };

  return {
    blogs,
    loading,
    error,
    pagination,
    fetchBlogs,
    toggleBlogStatus,
    deleteBlog,
    createBlog,
    updateBlog,
    search,
    searchTerm,
    refetch,
  };
};

// Bookings management hook
export const useAdminBookings = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBookings = async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getBookings(page, limit, search, status);
      setBookings(response.bookings || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.totalPages || response.pages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await adminService.updateBookingStatus(bookingId, status);
      await fetchBookings(pagination.page, pagination.limit);
      toast.success('Booking status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await adminService.deleteBooking(bookingId);
      await fetchBookings(pagination.page, pagination.limit);
      toast.success('Booking deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const refetch = () => fetchBookings(pagination.page, pagination.limit);
  const filterByStatus = (status: string) => fetchBookings(pagination.page, pagination.limit, undefined, status);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchBookings(pagination.page, pagination.limit, term);
  };

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    updateBookingStatus,
    deleteBooking,
    search,
    searchTerm,
    filterByStatus,
    refetch,
  };
};

// Destinations management hook
export const useAdminDestinations = () => {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchDestinations = async (page: number = 1, limit: number = 10, search?: string, country?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getDestinations(page, limit, search, country);
      setDestinations(response.destinations || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.totalPages || response.pages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch destinations');
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const createDestination = async (destinationData: any, featuredImage?: File) => {
    try {
      await adminService.createDestination(destinationData, featuredImage);
      await fetchDestinations(pagination.page, pagination.limit);
      toast.success('Destination created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create destination');
      return false;
    }
  };

  const updateDestination = async (destinationId: string, destinationData: any, featuredImage?: File) => {
    try {
      await adminService.updateDestination(destinationId, destinationData, featuredImage);
      await fetchDestinations(pagination.page, pagination.limit);
      toast.success('Destination updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update destination');
      return false;
    }
  };

  const deleteDestination = async (destinationId: string) => {
    try {
      await adminService.deleteDestination(destinationId);
      await fetchDestinations(pagination.page, pagination.limit);
      toast.success('Destination deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete destination');
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const refetch = () => fetchDestinations(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchDestinations(pagination.page, pagination.limit, term);
  };

  return {
    destinations,
    loading,
    error,
    pagination,
    fetchDestinations,
    createDestination,
    updateDestination,
    deleteDestination,
    search,
    searchTerm,
    refetch,
  };
};


