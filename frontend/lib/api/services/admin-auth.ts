import { apiClient } from '../client';
import { API_CONFIG } from '../config';

// Admin Authentication Types
export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminCreateRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export interface AdminPasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface AdminModel {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  admin: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export class AdminAuthService {
  // Login
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>(
        API_CONFIG.ENDPOINTS.ADMIN_AUTH.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Store admin tokens
        this.setTokens(response.data.access_token, response.data.refresh_token);
        this.setAdminData(response.data.admin);
        return response.data;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN_AUTH.LOGOUT);
    } catch (error) {
      console.error('Admin logout error:', error);
      // Continue with local logout even if server request fails
    } finally {
      this.clearTokens();
      this.clearAdminData();
    }
  }

  // Get current admin
  async getCurrentAdmin(): Promise<AdminModel> {
    try {
      const response = await apiClient.get<AdminModel>(
        API_CONFIG.ENDPOINTS.ADMIN_AUTH.ME
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get admin info');
    } catch (error: any) {
      console.error('Get current admin error:', error);
      throw error;
    }
  }

  // Create admin (only existing admins can do this)
  async createAdmin(adminData: AdminCreateRequest): Promise<AdminModel> {
    try {
      const response = await apiClient.post<AdminModel>(
        API_CONFIG.ENDPOINTS.ADMIN_AUTH.CREATE,
        adminData
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create admin');
    } catch (error: any) {
      console.error('Create admin error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData: AdminPasswordChangeRequest): Promise<void> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ADMIN_AUTH.CHANGE_PASSWORD,
        passwordData
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(data: { full_name: string; email: string }): Promise<AdminModel> {
    try {
      const response = await apiClient.put<AdminModel>(
        API_CONFIG.ENDPOINTS.ADMIN_AUTH.UPDATE_PROFILE,
        data
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('admin_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('admin_refresh_token');
  }

  // Admin data management
  private setAdminData(admin: any): void {
    localStorage.setItem('admin_user', JSON.stringify(admin));
  }

  private clearAdminData(): void {
    localStorage.removeItem('admin_user');
  }

  getAdminData(): any | null {
    const adminData = localStorage.getItem('admin_user');
    return adminData ? JSON.parse(adminData) : null;
  }

  // Check if admin is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Check if admin has specific role
  hasRole(role: string): boolean {
    const admin = this.getAdminData();
    return admin?.role === role;
  }

  // Check if admin is super admin
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
