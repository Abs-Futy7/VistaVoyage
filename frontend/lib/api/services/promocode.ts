import { apiClient } from '../client';
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
  offer_id?: string;
  max_usage?: number | null;
  current_usage?: number;
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
  async getPromoCodes(): Promise<PromoCodeListResponse> {
    try {
      const response = await apiClient.get<PromoCodeListResponse>('/api/v1/user/promo_codes');
      
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
      const response = await apiClient.post<ValidatePromoCodeResponse>('/api/v1/user/promo_codes/validate', data);
      
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
      const response = await apiClient.get<PromoCode>(`/api/v1/user/promo_codes/code/${code}`);
      
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
