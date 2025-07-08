import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

// Booking types based on backend schema
export interface Booking {
  id: string;
  package_id: string;
  user_id: string;
  promo_code_id?: string;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  discount_amount: number;
  booking_date: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Package information (joined from backend)
  packageTitle?: string;
  packageDescription?: string;
  packagePrice?: number;
  // User information (joined from backend)
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    createdAt: string;
  };
}

export interface CreateBookingRequest {
  package_id: string;
  total_amount: number;
  promo_code_id?: string;
  promo_code?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PromoValidationRequest {
  code?: string;
  promo_code_id?: string;
  booking_amount: number;
  package_id?: string;
}

export interface PromoValidationResponse {
  valid: boolean;
  promo_code_id?: string;
  discount_amount: number;
  discount_percentage?: number;
  final_amount: number;
  message: string;
  promo_code?: string;
}

export class BookingService {
  // Validate promo code before booking
  async validatePromoCode(request: PromoValidationRequest): Promise<ApiResponse<PromoValidationResponse>> {
    try {
      const params = new URLSearchParams();
      if (request.code) params.append('code', request.code);
      if (request.promo_code_id) params.append('promo_code_id', request.promo_code_id);
      params.append('booking_amount', request.booking_amount.toString());
      if (request.package_id) params.append('package_id', request.package_id);

      const response = await apiClient.post<PromoValidationResponse>(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.BASE}/validate-promo?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Promo validation error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to validate promo code',
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    try {
      const response = await apiClient.post<Booking>(
        API_CONFIG.ENDPOINTS.BOOKINGS.CREATE,
        bookingData
      );
      
      return response;
    } catch (error: any) {
      console.error('Create booking error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to create booking',
        errors: [error?.message || 'Booking creation failed']
      };
    }
  }

  async getUserBookings(page: number = 1, limit: number = 10, status?: string): Promise<ApiResponse<BookingListResponse>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await apiClient.get<BookingListResponse>(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.BASE}?${params.toString()}`
      );
      
      return response;
    } catch (error: any) {
      console.error('Get user bookings error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch bookings',
        errors: [error?.message || 'Failed to fetch bookings']
      };
    }
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    try {
      const response = await apiClient.get<Booking>(
        API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID(id)
      );
      
      return response;
    } catch (error: any) {
      console.error('Get booking error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to fetch booking',
        errors: [error?.message || 'Failed to fetch booking']
      };
    }
  }

  async cancelBooking(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL(id)
      );
      
      return response;
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to cancel booking',
        errors: [error?.message || 'Failed to cancel booking']
      };
    }
  }

  async makePayment(id: string, amount: number): Promise<ApiResponse<Booking>> {
    try {
      const response = await apiClient.patch<Booking>(
        API_CONFIG.ENDPOINTS.BOOKINGS.PAYMENT(id),
        { 
          booking_id: id,
          amount: amount,
          payment_status: 'pending'
        }
      );
      
      return response;
    } catch (error: any) {
      console.error('Make payment error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to process payment',
        errors: [error?.message || 'Payment processing failed']
      };
    }
  }
}

export const bookingService = new BookingService();
