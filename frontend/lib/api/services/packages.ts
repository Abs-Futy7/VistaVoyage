import { apiClient } from '../client';
import { API_CONFIG } from '../config';

// Public Package Types
export interface PublicPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_days: number;
  duration_nights: number;
  featured_image?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  destination_id: string;
  trip_type_id: string;
  offer_id?: string;
  // Rich content fields
  highlights?: string;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  terms_conditions?: string;
  image_gallery?: string;
  max_group_size?: number;
  min_age?: number;
  difficulty_level?: string;
  available_from?: string;
  available_until?: string;
}

export interface PackageSearchFilters {
  search?: string;
  destination_id?: string;
  trip_type_id?: string;
  min_price?: number;
  max_price?: number;
  difficulty?: string;
  is_featured?: boolean;
}

export interface PackagesResponse {
  packages: PublicPackage[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export class PackageService {
  async getAllPackages(
    page: number = 1,
    limit: number = 12,
    filters?: PackageSearchFilters,
    token?: string
  ): Promise<PackagesResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters && Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await apiClient.get<PackagesResponse>(
        `${API_CONFIG.ENDPOINTS.PACKAGES.BASE}?${params}`,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch packages');
    } catch (error: any) {
      console.error('Get packages error:', error);
      throw error;
    }
  }

  async getPackageById(id: string, token?: string): Promise<PublicPackage> {
    try {
      const response = await apiClient.get<PublicPackage>(
        API_CONFIG.ENDPOINTS.PACKAGES.BY_ID(id),
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      
      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch package');
    } catch (error: any) {
      console.error('Get package error:', error);
      throw error;
    }
  }

  async getPopularPackages(limit: number = 6, token?: string): Promise<PublicPackage[]> {
    try {
      const response = await apiClient.get<{ packages: PublicPackage[] }>(
        `${API_CONFIG.ENDPOINTS.PACKAGES.FEATURED}?limit=${limit}`,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      
      if (response.success && response.data) {
        return response.data.packages;
      }

      throw new Error('Failed to fetch popular packages');
    } catch (error: any) {
      console.error('Get popular packages error:', error);
      throw error;
    }
  }

  async getFeaturedPackages(limit: number = 6, token?: string): Promise<PublicPackage[]> {
    try {
      const response = await apiClient.get<{ packages: PublicPackage[] }>(
        `${API_CONFIG.ENDPOINTS.PACKAGES.FEATURED}?limit=${limit}`,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );

      if (response.success && response.data) {
        return response.data.packages;
      }

      throw new Error('Failed to fetch featured packages');
    } catch (error: any) {
      console.error('Get featured packages error:', error);
      throw error;
    }
  }

  async searchPackages(
    query: string,
    filters?: Omit<PackageSearchFilters, 'search'>,
    token?: string
  ): Promise<PublicPackage[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters && Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await apiClient.get<{ packages: PublicPackage[] }>(
        `${API_CONFIG.ENDPOINTS.PACKAGES.SEARCH}?${params}`,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );

      if (response.success && response.data) {
        return response.data.packages;
      }

      throw new Error('Failed to search packages');
    } catch (error: any) {
      console.error('Search packages error:', error);
      throw error;
    }
  }
}

export const packageService = new PackageService();
