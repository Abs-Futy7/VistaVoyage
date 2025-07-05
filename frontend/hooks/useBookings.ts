"use client";
import { useState, useEffect } from 'react';
import { bookingService, Booking, BookingListResponse } from '@/lib/api/services/bookings';
import { toast } from 'sonner';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBookings = async (page: number = 1, limit: number = 10, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getUserBookings(page, limit, status);
      
      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.total_pages
        });
      } else {
        setError(response.message || 'Failed to fetch bookings');
        setBookings([]);
      }
    } catch (err: any) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getBookingById = async (id: string) => {
    try {
      const response = await bookingService.getBookingById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch booking');
      }
    } catch (err: any) {
      console.error('Get booking error:', err);
      toast.error('Failed to load booking details');
      throw err;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const response = await bookingService.cancelBooking(id);
      
      if (response.success) {
        toast.success('Booking cancelled successfully');
        // Refresh bookings list
        await fetchBookings(pagination.page, pagination.limit);
        return true;
      } else {
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      toast.error('Failed to cancel booking');
      return false;
    }
  };

  const validatePromoCode = async (request: {
    code?: string;
    promo_code_id?: string;
    booking_amount: number;
    package_id?: string;
  }) => {
    try {
      const response = await bookingService.validatePromoCode(request);
      return response;
    } catch (err: any) {
      console.error('Validate promo code error:', err);
      toast.error('Failed to validate promo code');
      throw err;
    }
  };

  const makePayment = async (id: string, amount: number) => {
    try {
      const response = await bookingService.makePayment(id, amount);
      
      if (response.success) {
        toast.success('Payment processed successfully');
        // Refresh bookings list
        await fetchBookings(pagination.page, pagination.limit);
        return true;
      } else {
        throw new Error(response.message || 'Failed to process payment');
      }
    } catch (err: any) {
      console.error('Make payment error:', err);
      toast.error('Failed to process payment');
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const refetch = () => fetchBookings(pagination.page, pagination.limit);
  const filterByStatus = (status?: string) => fetchBookings(1, pagination.limit, status);

  return {
    bookings,
    loading,
    error,
    pagination,
    fetchBookings,
    getBookingById,
    cancelBooking,
    makePayment,
    validatePromoCode,
    refetch,
    filterByStatus
  };
}
