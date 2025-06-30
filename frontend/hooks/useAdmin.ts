import { useState, useEffect, useCallback } from 'react';
import { adminAuthService, AdminModel } from '@/lib/api/services/admin-auth';
import { adminService } from '@/lib/api/services/admin';
import { 
  AdminUser,
  AdminPackage,
  AdminBooking,
  AdminBlog,
  AdminDestination,
  AdminTripType,
  AdminActivity,
  AdminOffer,
  AdminPromoCode,
  DashboardStats,
  SystemStats,
  PaginatedResponse 
} from '@/lib/api/services/admin';
import { toast } from 'sonner';

// Hook for admin authentication (simplified without zustand for now)
export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState<AdminModel | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = adminAuthService.isAuthenticated();
      const adminData = adminAuthService.getAdminData();
      setIsAuthenticated(isAuth);
      setAdmin(adminData);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await adminAuthService.login({ username, password });
      
      setIsAuthenticated(true);
      setAdmin({
        ...response.admin,
        is_active: true,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as AdminModel);
      setIsLoading(false);
      
      toast.success('Welcome back!', {
        description: `Logged in as ${response.admin.full_name}`
      });
      
      return true;
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials'
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await adminAuthService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server request fails
    } finally {
      setIsAuthenticated(false);
      setAdmin(null);
      setIsLoading(false);
    }
  };

  const getCurrentAdmin = async (): Promise<void> => {
    if (!adminAuthService.isAuthenticated()) {
      setIsAuthenticated(false);
      setAdmin(null);
      return;
    }

    setIsLoading(true);
    try {
      const adminData = await adminAuthService.getCurrentAdmin();
      setIsAuthenticated(true);
      setAdmin(adminData);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Get current admin error:', error);
      setIsAuthenticated(false);
      setAdmin(null);
      setIsLoading(false);
      
      if (error.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again'
        });
      }
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await adminAuthService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setIsLoading(false);
      toast.success('Password changed successfully');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Failed to change password', {
        description: error.message || 'Please try again'
      });
      return false;
    }
  };

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
        'manage_trip_types',
        'manage_activities',
        'manage_offers',
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
    login,
    logout,
    getCurrentAdmin,
    changePassword,
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
    search,
    searchTerm,
    filterByStatus,
    refetch,
  };
};

// Offers management hook
export const useAdminOffers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchOffers = async (page: number = 1, limit: number = 10, search?: string, offerType?: string, isActive?: boolean) => {
    try {
      setLoading(true);
      const response = await adminService.getOffers(page, limit, search, offerType, isActive);
      setOffers(response.offers || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.pages || response.totalPages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch offers');
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferStatus = async (offerId: string) => {
    try {
      const idString = String(offerId);
      await adminService.toggleOfferActiveStatus(idString);
      await fetchOffers(pagination.page, pagination.limit);
      toast.success('Offer status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update offer status');
    }
  };

  const deleteOffer = async (offerId: string) => {
    try {
      const idString = String(offerId);
      await adminService.deleteOffer(idString);
      await fetchOffers(pagination.page, pagination.limit);
      toast.success('Offer deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete offer');
    }
  };

  const createOffer = async (offerData: any) => {
    try {
      await adminService.createOffer(offerData);
      await fetchOffers(pagination.page, pagination.limit);
      toast.success('Offer created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create offer');
      return false;
    }
  };

  const updateOffer = async (offerId: string, offerData: any) => {
    try {
      await adminService.updateOffer(offerId, offerData);
      await fetchOffers(pagination.page, pagination.limit);
      toast.success('Offer updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update offer');
      return false;
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const refetch = () => fetchOffers(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchOffers(pagination.page, pagination.limit, term);
  };

  return {
    offers,
    loading,
    error,
    pagination,
    fetchOffers,
    toggleOfferStatus,
    deleteOffer,
    createOffer,
    updateOffer,
    search,
    searchTerm,
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

// Trip Types management hook
export const useAdminTripTypes = () => {
  const [tripTypes, setTripTypes] = useState<AdminTripType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchTripTypes = async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      setLoading(true);
      console.log('Fetching trip types...', { page, limit, search });
      
      const response = await adminService.getTripTypes(page, limit, search);
      console.log('Trip types response:', response);
      
      // Ensure we have an array - handle different response formats
      const tripTypesData = response.trip_types || response.data || [];
      console.log('Trip types data:', tripTypesData, 'is array:', Array.isArray(tripTypesData));
      
      setTripTypes(Array.isArray(tripTypesData) ? tripTypesData : []);
      
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.total_pages || response.totalPages || response.pages || Math.ceil((response.total || 0) / limit)
      });
      setError(null);
    } catch (err: any) {
      console.error('Fetch trip types error:', err);
      setError(err.message || 'Failed to fetch trip types');
      setTripTypes([]); // Ensure tripTypes is always an array
      toast.error('Failed to load trip types');
    } finally {
      setLoading(false);
    }
  };

  const createTripType = async (tripTypeData: any) => {
    try {
      await adminService.createTripType(tripTypeData);
      await fetchTripTypes(pagination.page, pagination.limit);
      toast.success('Trip type created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create trip type');
      return false;
    }
  };

  const updateTripType = async (tripTypeId: string, tripTypeData: any) => {
    try {
      await adminService.updateTripType(tripTypeId, tripTypeData);
      await fetchTripTypes(pagination.page, pagination.limit);
      toast.success('Trip type updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update trip type');
      return false;
    }
  };

  const deleteTripType = async (tripTypeId: string) => {
    try {
      await adminService.deleteTripType(tripTypeId);
      await fetchTripTypes(pagination.page, pagination.limit);
      toast.success('Trip type deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete trip type');
    }
  };

  useEffect(() => {
    fetchTripTypes();
  }, []);

  const refetch = () => fetchTripTypes(pagination.page, pagination.limit);
  const search = (term?: string) => {
    const currentSearchTerm = term !== undefined ? term : searchTerm;
    setSearchTerm(currentSearchTerm);
    fetchTripTypes(1, pagination.limit, currentSearchTerm);
  };

  // Function for form submission
  const handleSearch = () => {
    fetchTripTypes(1, pagination.limit, searchTerm);
  };

  return {
    tripTypes,
    loading,
    error,
    pagination,
    fetchTripTypes,
    createTripType,
    updateTripType,
    deleteTripType,
    search: handleSearch,
    searchTerm,
    setSearchTerm,
    refetch,
  };
};

// Activities management hook
export const useAdminActivities = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchActivities = async (page: number = 1, limit: number = 10, search?: string, activityType?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getActivities(page, limit, search, activityType);
      setActivities(response.activities || response.data || []);
      setPagination({
        page,
        limit,
        total: response.total,
        totalPages: response.totalPages || response.pages || Math.ceil(response.total / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: any, featuredImage?: File) => {
    try {
      await adminService.createActivity(activityData, featuredImage);
      await fetchActivities(pagination.page, pagination.limit);
      toast.success('Activity created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create activity');
      return false;
    }
  };

  const updateActivity = async (activityId: string, activityData: any, featuredImage?: File) => {
    try {
      await adminService.updateActivity(activityId, activityData, featuredImage);
      await fetchActivities(pagination.page, pagination.limit);
      toast.success('Activity updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update activity');
      return false;
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await adminService.deleteActivity(activityId);
      await fetchActivities(pagination.page, pagination.limit);
      toast.success('Activity deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete activity');
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const refetch = () => fetchActivities(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchActivities(pagination.page, pagination.limit, term);
  };

  return {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    search,
    searchTerm,
    refetch,
  };
};

// Promo Codes management hook
export const useAdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchPromoCodes = async (page: number = 1, limit: number = 10, search?: string, isActive?: boolean) => {
    try {
      setLoading(true);
      const response = await adminService.getPromoCodes(page, limit, search, isActive);
      
      // Handle different response structures
      const promoCodesData = response.promo_codes || response.data || [];
      setPromoCodes(Array.isArray(promoCodesData) ? promoCodesData : []);
      
      setPagination({
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.total_pages || response.totalPages || response.pages || Math.ceil((response.total || 0) / limit)
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promo codes');
      setPromoCodes([]); // Ensure promoCodes is always an array
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async (promoCodeData: any) => {
    try {
      await adminService.createPromoCode(promoCodeData);
      await fetchPromoCodes(pagination.page, pagination.limit);
      toast.success('Promo code created successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to create promo code');
      return false;
    }
  };

  const updatePromoCode = async (promoCodeId: string, promoCodeData: any) => {
    try {
      await adminService.updatePromoCode(promoCodeId, promoCodeData);
      await fetchPromoCodes(pagination.page, pagination.limit);
      toast.success('Promo code updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to update promo code');
      return false;
    }
  };

  const togglePromoCodeStatus = async (promoCodeId: string) => {
    try {
      await adminService.togglePromoCodeActiveStatus(promoCodeId);
      await fetchPromoCodes(pagination.page, pagination.limit);
      toast.success('Promo code status updated successfully');
    } catch (err: any) {
      toast.error('Failed to update promo code status');
    }
  };

  const deletePromoCode = async (promoCodeId: string) => {
    try {
      await adminService.deletePromoCode(promoCodeId);
      await fetchPromoCodes(pagination.page, pagination.limit);
      toast.success('Promo code deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete promo code');
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const refetch = () => fetchPromoCodes(pagination.page, pagination.limit);
  const search = (term: string) => {
    setSearchTerm(term);
    fetchPromoCodes(pagination.page, pagination.limit, term);
  };

  return {
    promoCodes,
    loading,
    error,
    pagination,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    togglePromoCodeStatus,
    deletePromoCode,
    search,
    searchTerm,
    refetch,
  };
};
