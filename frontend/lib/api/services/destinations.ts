import { apiClient } from '../client';
import { ApiResponse } from '../types';

export interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  description?: string;
  image?: string;
  imageUrl?: string; // Added imageUrl property
  featured_image?: string; // Added featured_image property
  best_time_to_visit?: string; // Added best_time_to_visit property
  timezone?: string; // Added timezone property
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationSearchFilters {
  search?: string;
  region?: string;
}

export interface DestinationListResponse {
  destinations: Destination[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const destinationService = {
  async getDestinationById(id: string): Promise<Destination> {
    try {
      const response = await apiClient.get<Destination>(`/api/v1/user/destinations/${id}`);
      
      if (response.success && response.data) {
        const destination = response.data;
        return {
          ...destination,
          imageUrl: destination.featured_image || 'https://via.placeholder.com/300', // Map featured_image to imageUrl
        };
      }
      
      throw new Error('Destination not found');
    } catch (error: any) {
      console.error('Get destination error:', error);
      throw error;
    }
  },

  async getAllDestinations(
    page: number,
    limit: number,
    filters?: DestinationSearchFilters
  ): Promise<DestinationListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.region && { region: filters.region }),
      });

      const response = await apiClient.get<DestinationListResponse>(`/api/v1/user/destinations?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        const transformedDestinations = response.data.destinations.map((destination) => ({
          ...destination,
          imageUrl: destination.featured_image || 'https://via.placeholder.com/300', // Map featured_image to imageUrl
        }));
        
        return {
          ...response.data,
          destinations: transformedDestinations,
        };
      }
      
      throw new Error('Failed to fetch destinations');
    } catch (error: any) {
      console.error('Get destinations error:', error);
      throw error;
    }
  },
};
