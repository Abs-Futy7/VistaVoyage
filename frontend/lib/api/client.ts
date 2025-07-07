import { API_CONFIG, REQUEST_TIMEOUT } from './config';
import { ApiResponse, ApiError } from './types';

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },
  
  getAdminAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_access_token');
  },
  
  getAdminRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_refresh_token');
  },
  
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    console.log('Clearing all tokens from localStorage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
    // Also clear any admin tokens
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  },

  // Debug method to check current token status
  debugTokens: () => {
    if (typeof window === 'undefined') return 'Server-side rendering';
    
    const accessToken = localStorage.getItem('access_token');
    const adminAccessToken = localStorage.getItem('admin_access_token');
    
    // Helper to decode JWT payload
    const decodeToken = (token: string | null) => {
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        return {
          ...payload,
          isExpired,
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
          timeLeft: isExpired ? 'EXPIRED' : `${Math.floor((payload.exp - now) / 60)} minutes`
        };
      } catch {
        return { error: 'Invalid token format' };
      }
    };
    
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!localStorage.getItem('refresh_token'),
      hasAdminAccessToken: !!adminAccessToken,
      hasAdminRefreshToken: !!localStorage.getItem('admin_refresh_token'),
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      userToken: decodeToken(accessToken),
      adminToken: decodeToken(adminAccessToken)
    };
  }
};

// Custom fetch wrapper with error handling and token management
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  // Trigger login dialog - can be overridden by custom event listener
  private triggerLoginDialog(message: string) {
    if (typeof window !== 'undefined') {
      // Dispatch custom event that components can listen to
      window.dispatchEvent(new CustomEvent('auth:loginRequired', { 
        detail: { message } 
      }));
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers - only set Content-Type if not FormData
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for JSON if not already set and not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available - use admin token for admin endpoints
    let token: string | null = null;
    if (endpoint.startsWith('/api/v1/admin/')) {
      token = tokenManager.getAdminAccessToken();
    } else {
      token = tokenManager.getAccessToken();
    }
    
    console.log(`API Request to ${endpoint}:`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      endpoint
    });
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    // Request configuration
    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      // Clear timeout on successful response
      clearTimeout(timeoutId);
      
      // Handle unauthorized - attempt token refresh
      if (response.status === 401 && token) {
        let refreshed = false;
        
        if (endpoint.startsWith('/api/v1/admin/')) {
          // Admin token refresh
          refreshed = await this.refreshAdminToken();
          if (refreshed) {
            // Retry the original request with new admin token
            headers['Authorization'] = `Bearer ${tokenManager.getAdminAccessToken()}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return this.handleResponse<T>(retryResponse);
          } else {
            // Admin refresh failed, clear admin tokens and trigger login dialog
            this.clearAdminTokens();
            this.triggerLoginDialog('Your admin session has expired. Please login again.');
          }
        } else {
          // Regular user token refresh
          refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return this.handleResponse<T>(retryResponse);
          } else {
            // Refresh failed, clear tokens and trigger login dialog
            tokenManager.clearTokens();
            this.triggerLoginDialog('Your session has expired. Please login again.');
          }
        }
      }

      // Handle unauthorized without token (not logged in)
      if (response.status === 401 && !token) {
        this.triggerLoginDialog('You need to login to access this feature.');
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      console.error('API request failed:', {
        url,
        method: config.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown'
      });
      throw this.createApiError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    if (!response.ok) {
      const errorData = isJson ? await response.json() : { message: response.statusText };
      
      // Handle FastAPI validation errors which come in 'detail' field
      let message = errorData.message || errorData.detail || 'An error occurred';
      let errors: string[] = [];
      
      // FastAPI validation errors have a specific format
      if (errorData.detail && Array.isArray(errorData.detail)) {
        errors = errorData.detail.map((err: any) => 
          `${err.loc?.join('.') || 'Field'}: ${err.msg || err}`
        );
        message = 'Validation error';
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        errors = [errorData.detail];
      } else if (errorData.errors) {
        errors = errorData.errors;
      }
      
      throw {
        message,
        status: response.status,
        errors
      } as ApiError;
    }

    if (isJson) {
      const jsonData = await response.json();
      
      // If the response already has a 'success' field, return as-is
      if (jsonData.hasOwnProperty('success')) {
        return jsonData;
      }
      
      // Otherwise, wrap the response in our expected format
      // This handles FastAPI responses which return data directly
      return {
        success: true,
        data: jsonData as T
      };
    }

    return {
      success: true,
      data: response as T
    };
  }

  private createApiError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout - Server not responding',
        status: 408,
        errors: [
          'The request timed out after 10 seconds',
          'Possible causes:',
          '• FastAPI server is not running',
          '• Server is taking too long to respond',
          '• Network connectivity issues',
          '• Firewall blocking the connection'
        ]
      };
    }

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        message: 'Network connection error',
        status: 0,
        errors: [
          'Cannot connect to the server. Please check:',
          '1. FastAPI server is running and accessible',
          '2. Correct API URL in environment variables',
          '3. CORS is properly configured',
          '4. Your internet connection is working',
          '5. No firewall blocking the connection'
        ]
      };
    }

    return {
      message: error.message || 'Network error',
      status: 0,
      errors: [error.message || 'Failed to connect to the server']
    };
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        tokenManager.setTokens(data.access_token, data.refresh_token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async refreshAdminToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getAdminRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN_AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAdminTokens(data.access_token, data.refresh_token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private setAdminTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
  }

  private clearAdminTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  }

  // HTTP methods
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: headers || {},
    });
  }
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  // Form data methods for file uploads and form submissions
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async patchFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  // Test connection to the API
  async testConnection(): Promise<{ success: boolean; message: string; details: string[] }> {
    const details: string[] = [];
    
    try {
      details.push(`Testing connection to: ${this.baseURL}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for test
      
      const response = await fetch(`${this.baseURL}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        details.push(`✅ Server is running: ${data.message || 'OK'}`);
        details.push(`✅ Status: ${response.status} ${response.statusText}`);
        return {
          success: true,
          message: 'Connection successful',
          details
        };
      } else {
        details.push(`❌ Server error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          message: 'Server responded with error',
          details
        };
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        details.push('❌ Connection timeout (3 seconds)');
        details.push('Server is not responding or taking too long');
      } else if (error.message?.includes('Failed to fetch')) {
        details.push('❌ Cannot reach server');
        details.push('Server may not be running or network issue');
      } else {
        details.push(`❌ Error: ${error.message}`);
      }
      
      return {
        success: false,
        message: 'Connection failed',
        details
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Expose to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).tokenManager = tokenManager;
  (window as any).apiClient = apiClient;
  console.log('🔧 Debug helpers exposed to window:', {
    tokenManager: 'window.tokenManager',
    apiClient: 'window.apiClient',
    examples: [
      'tokenManager.debugTokens() - Check current token status',
      'tokenManager.clearTokens() - Clear all tokens',
      'apiClient.testConnection() - Test API connection'
    ]
  });
}
