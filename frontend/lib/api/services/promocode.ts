import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  discount_type: string;
  discount_value: number;
  minimum_amount?: number | null;
  maximum_discount?: number | null;
  start_date?: string;
  expiry_date: string;
  usage_limit?: number | null;
  used_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  remaining_uses?: number | null;
  is_valid?: boolean;
  is_expired?: boolean;
}

export interface PromoCodeListResponse {
  promo_codes: PromoCode[];
  total_count: number;
}

export interface ValidatePromoCodeRequest {
  code: string;
  booking_amount?: number;
}

export interface ValidatePromoCodeResponse {
  is_valid: boolean;
  discount_amount?: number;
  message?: string;
  promo_code?: PromoCode;
}

export const promoCodeService = {
  // Admin endpoints
  async createPromoCode(data: Partial<PromoCode>): Promise<PromoCode> {
    try {
      // Remove unsupported fields before sending to backend
      const cleanData = { ...data };
      delete (cleanData as any).offer_id;
      delete (cleanData as any).max_usage;
      delete (cleanData as any).current_usage;
      const response = await apiClient.post<PromoCode>(API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_CREATE, cleanData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create promo code');
    } catch (error: any) {
      console.error('Create promo code error:', error);
      throw error;
    }
  },

  async updatePromoCode(id: string, data: Partial<PromoCode>): Promise<PromoCode> {
    try {
      // Remove unsupported fields before sending to backend
      const cleanData = { ...data };
      delete (cleanData as any).offer_id;
      delete (cleanData as any).max_usage;
      delete (cleanData as any).current_usage;
      const response = await apiClient.put<PromoCode>(API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_UPDATE(id), cleanData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to update promo code');
    } catch (error: any) {
      console.error('Update promo code error:', error);
      throw error;
    }
  },

  async deletePromoCode(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_DELETE(id));
      if (!response.success) {
        throw new Error('Failed to delete promo code');
      }
    } catch (error: any) {
      console.error('Delete promo code error:', error);
      throw error;
    }
  },

  async togglePromoCodeStatus(id: string): Promise<PromoCode> {
    try {
      const response = await apiClient.patch<PromoCode>(API_CONFIG.ENDPOINTS.ADMIN.PROMO_CODE_TOGGLE_ACTIVE(id), {});
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to toggle promo code status');
    } catch (error: any) {
      console.error('Toggle promo code status error:', error);
      throw error;
    }
  },
  async getPromoCodes(): Promise<PromoCodeListResponse> {
    try {
      const response = await apiClient.get<PromoCodeListResponse>(API_CONFIG.ENDPOINTS.PROMO_CODES.BASE);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch promo codes');
    } catch (error: any) {
      console.error('Get promo codes error:', error);
      throw error;
    }
  },

  async validatePromoCode(data: ValidatePromoCodeRequest): Promise<ValidatePromoCodeResponse> {
    try {
      const response = await apiClient.post<ValidatePromoCodeResponse>(API_CONFIG.ENDPOINTS.PROMO_CODES.VALIDATE, data);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Failed to validate promo code');
    } catch (error: any) {
      console.error('Validate promo code error:', error);
      throw error;
    }
  },

  async getPromoCodeByCode(code: string): Promise<PromoCode> {
    try {
      const response = await apiClient.get<PromoCode>(API_CONFIG.ENDPOINTS.PROMO_CODES.BY_CODE(code));
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Promo code not found');
    } catch (error: any) {
      console.error('Get promo code by code error:', error);
      throw error;
    }
  },
};
