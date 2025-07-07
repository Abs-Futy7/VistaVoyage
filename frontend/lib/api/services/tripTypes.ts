import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface TripType {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TripTypeListResponse {
  trip_types: TripType[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const tripTypeService = {
  async getTripTypes(page = 1, limit = 10, search = ''): Promise<TripTypeListResponse> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      
      const response = await apiClient.get<TripTypeListResponse>(
        `${API_CONFIG.ENDPOINTS.USER_API.TRIP_TYPES.BASE}?${params.toString()}`
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch trip types');
    } catch (error: any) {
      console.error('Get trip types error:', error);
      throw error;
    }
  },

  async getTripTypeById(id: string): Promise<TripType> {
    try {
      const response = await apiClient.get<TripType>(
        API_CONFIG.ENDPOINTS.USER_API.TRIP_TYPES.BY_ID(id)
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch trip type');
    } catch (error: any) {
      console.error('Get trip type error:', error);
      throw error;
    }
  },
};
