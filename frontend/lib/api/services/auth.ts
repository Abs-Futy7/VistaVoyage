import { apiClient, tokenManager } from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, RegisterRequest, AuthResponse, User, UserUpdateModel } from '../types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Store tokens
        tokenManager.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        
        // Set authentication flag
        localStorage.setItem('isAuthenticated', 'true');
        
        // Dispatch storage event for real-time updates
        window.dispatchEvent(new Event('storage'));
        
        return response.data;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (response.success && response.data) {
        // Store tokens
        tokenManager.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        
        // Set authentication flag
        localStorage.setItem('isAuthenticated', 'true');
        
        // Dispatch storage event for real-time updates
        window.dispatchEvent(new Event('storage'));
        
        return response.data;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      tokenManager.clearTokens();
      window.dispatchEvent(new Event('storage'));
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch profile');
    } catch (error: any) {
      console.error('Get profile error:', error?.message || error);
      throw error;
    }
  }

  async updateProfile(userData: UserUpdateModel): Promise<User> {
    try {
      const response = await apiClient.patch<any>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        userData
      );
      
      if (response.success && response.data) {
        // Backend returns { message: "...", user: {...} }
        const responseData = response.data as { message: string; user: User };
        return responseData.user;
      }

      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error?.message || error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, new_password: newPassword }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuthenticated') === 'true' && !!tokenManager.getAccessToken();
  }

  // Get current user from token (if needed for client-side operations)
  getCurrentUser(): User | null {
    // This would typically decode the JWT token to get user info
    // For now, you might want to store user info separately or call the profile endpoint
    return null;
  }
}

// Export singleton instance
export const authService = new AuthService();
