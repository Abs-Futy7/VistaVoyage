import { apiClient } from '../client';
import { ApiResponse } from '../types';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OfferListResponse {
  offers: Offer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const offerService = {
  async getOffers(page = 1, limit = 10, search = ''): Promise<OfferListResponse> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append('search', search);
      
      const response = await apiClient.get<OfferListResponse>(`/api/v1/user/offers?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch offers');
    } catch (error: any) {
      console.error('Get offers error:', error);
      throw error;
    }
  },

  async getOfferById(id: string): Promise<Offer> {
    try {
      const response = await apiClient.get<Offer>(`/api/v1/user/offers/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch offer');
    } catch (error: any) {
      console.error('Get offer error:', error);
      throw error;
    }
  },
};
