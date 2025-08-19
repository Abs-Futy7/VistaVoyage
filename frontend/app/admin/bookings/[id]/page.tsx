"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Package, Calendar, DollarSign, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { adminService, AdminBookingDetails } from '@/lib/api/services/admin';

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const [booking, setBooking] = useState<AdminBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchBookingDetails();
  }, [resolvedParams.id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBookingDetails(resolvedParams.id);
      setBooking(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch booking details:', err);
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded') => {
    if (!booking) return;
    
    try {
      setUpdating(true);
      await adminService.updateBookingStatus(resolvedParams.id, newStatus);
      setBooking({ ...booking, status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error loading booking details</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={fetchBookingDetails} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Booking not found</h2>
          <p className="text-gray-600 mt-2">The requested booking could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {booking.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Package ID</span>
                <span className="font-medium">{booking.package_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Package Name</span>
                <span className="font-medium">{booking.packageTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-right max-w-64">{booking.packageDescription || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Package Price</span>
                <span className="font-medium">TK {booking.packagePrice}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer ID</span>
                <span className="font-medium">{booking.user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name</span>
                <span className="font-medium">{booking.user?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </span>
                <span className="font-medium">{booking.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </span>
                <span className="font-medium">{booking.user?.phone || 'N/A'}</span>
              </div>
              {/* Location (city, country) removed as per backend model */}
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth</span>
                <span className="font-medium">{booking.user?.dateOfBirth && booking.user.dateOfBirth !== null ? new Date(booking.user.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Since</span>
                <span className="font-medium">{booking.user?.createdAt ? new Date(booking.user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Status & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <Badge variant="outline" className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment</span>
                <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                  {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">TK {booking.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">TK {booking.paid_amount}</span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-TK {booking.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-medium text-red-600">TK {booking.total_amount - booking.paid_amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date</span>
                <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">{new Date(booking.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === 'pending' && (
                <Button 
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Confirm Booking
                </Button>
              )}
              {booking.status === 'confirmed' && (
                <Button 
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Mark as Completed
                </Button>
              )}
              {/* Admin can always cancel a booking (except if already cancelled) */}
              {booking.status !== 'cancelled' && (
                <Button 
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                  variant="destructive"
                  className="w-full"
                >
                  {booking.status === 'completed' ? 'Cancel Booking (Admin Override)' : 'Cancel Booking'}
                </Button>
              )}
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => booking.user?.email && window.open(`mailto:${booking.user.email}`, '_blank')}
                disabled={!booking.user?.email}
              >
                Contact Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
