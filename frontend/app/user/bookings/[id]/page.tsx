"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Calendar, DollarSign, User, MapPin, CreditCard, Download, Receipt, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useBookings } from '@/hooks/useBookings';
import { Booking } from '@/lib/api/services/bookings';
import Link from 'next/link';

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBookingById, makePayment, cancelBooking } = useBookings();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchBookingDetails();
  }, [resolvedParams.id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await getBookingById(resolvedParams.id);
      setBooking(bookingData);
    } catch (err: any) {
      console.error('Failed to fetch booking details:', err);
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
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
      case 'refunded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
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

  const canMakePayment = (booking: Booking) => {
    const paymentPending = booking.payment_status === 'pending' || booking.payment_status === 'partially_paid';
    const statusActive = booking.status === 'pending' || booking.status === 'confirmed';
    const notCancelled = !['cancelled', 'refunded', 'completed'].includes(booking.status);
    const hasOutstanding = booking.paid_amount < booking.total_amount;
    
    return paymentPending && statusActive && notCancelled && hasOutstanding;
  };

  const canCancelBooking = (booking: Booking) => {
    return ['pending', 'confirmed'].includes(booking.status);
  };

  const handleMakePayment = async () => {
    if (!booking) return;
    
    const remainingAmount = booking.total_amount - booking.paid_amount;
    setProcessingPayment(true);
    
    try {
      const success = await makePayment(booking.id, remainingAmount);
      if (success) {
        await fetchBookingDetails(); // Refresh the data
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancellingBooking(true);
    
    try {
      const success = await cancelBooking(booking.id);
      if (success) {
        await fetchBookingDetails(); // Refresh the data
      }
    } finally {
      setCancellingBooking(false);
    }
  };

  const generateInvoice = (booking: Booking) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${booking.id.substring(0, 8).toUpperCase()}</title>
        <style>
          @page { size: A4; margin: 0.5in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
          .invoice-container { max-width: 100%; margin: 0 auto; background: white; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #2563eb; }
          .company-info h1 { color: #2563eb; font-size: 24px; margin-bottom: 5px; }
          .company-info p { font-size: 10px; color: #666; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { color: #2563eb; font-size: 20px; margin-bottom: 5px; }
          .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .section { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .section-title { color: #2563eb; font-weight: bold; font-size: 12px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .detail-label { font-weight: 600; }
          .package-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb; }
          .package-title { font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
          .amount-breakdown { background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; }
          .amount-row { display: flex; justify-content: space-between; margin-bottom: 6px; padding: 2px 0; }
          .amount-row.total { font-weight: bold; font-size: 12px; border-top: 1px solid #059669; padding-top: 6px; margin-top: 6px; color: #059669; }
          .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
          .status-confirmed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-completed { background: #dbeafe; color: #1e40af; }
          .status-cancelled { background: #fecaca; color: #991b1b; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>VistaVoyage</h1>
              <p>Your Gateway to Extraordinary Adventures</p>
              <p>Email: info@vistavoyage.com | Phone: +880-123-456-789</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="content-grid">
            <div class="section">
              <h3 class="section-title">Invoice Details</h3>
              <div class="detail-row">
                <span class="detail-label">Invoice #:</span>
                <span>INV-${booking.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span style="font-size: 9px; word-break: break-all; line-height: 1.2;">${booking.id}</span>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span>${booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travelers:</span>
                <span>${booking.packagePrice ? Math.round((booking.total_amount + booking.discount_amount) / booking.packagePrice) : 1} person(s)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
              </div>
            </div>
          </div>

          <div class="package-info">
            <div class="package-title">${booking.packageTitle || 'Package Details Not Available'}</div>
            ${booking.packagePrice ? `<div style="font-size: 11px;"><strong>Price per person:</strong> TK ${booking.packagePrice.toLocaleString()}</div>` : ''}
          </div>

          <div class="amount-breakdown">
            <h3 class="section-title">Amount Breakdown</h3>
            <div class="amount-row">
              <span>Subtotal:</span>
              <span>TK ${(booking.total_amount + booking.discount_amount).toLocaleString()}</span>
            </div>
            ${booking.discount_amount > 0 ? `
            <div class="amount-row" style="color: #059669;">
              <span>Discount Applied:</span>
              <span>-TK ${booking.discount_amount.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="amount-row total">
              <span>Total Amount:</span>
              <span>TK ${booking.total_amount.toLocaleString()}</span>
            </div>
            <div class="amount-row">
              <span>Paid Amount:</span>
              <span>TK ${booking.paid_amount.toLocaleString()}</span>
            </div>
            ${booking.paid_amount < booking.total_amount ? `
            <div class="amount-row" style="color: #dc2626;">
              <span>Outstanding Balance:</span>
              <span>TK ${(booking.total_amount - booking.paid_amount).toLocaleString()}</span>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Thank you for choosing VistaVoyage for your travel needs!</p>
            <p>For any queries regarding this invoice, please contact us at billing@vistavoyage.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Error loading booking details</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button onClick={fetchBookingDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Booking not found</h2>
            <p className="text-gray-600 mt-2">The requested booking could not be found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Information */}
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
                <Link 
                  href={`/packages/${booking.package_id}`}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {booking.packageTitle || 'View Package Details'}
                </Link>
              </div>
              {booking.packageDescription && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description</span>
                  <span className="font-medium text-right max-w-64">{booking.packageDescription}</span>
                </div>
              )}
              {booking.packagePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-medium">TK {booking.packagePrice.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date</span>
                <span className="font-medium">
                  {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Travelers</span>
                <span className="font-medium">
                  {booking.packagePrice ? 
                    Math.round((booking.total_amount + booking.discount_amount) / booking.packagePrice) : 1
                  } person(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Status</span>
                <Badge variant="outline" className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                  {booking.payment_status === "partially_paid" ? "Partially Paid" : 
                   booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                </Badge>
              </div>
              {booking.cancellation_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Date</span>
                  <span className="font-medium">
                    {new Date(booking.cancellation_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {booking.cancellation_reason && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Reason</span>
                  <span className="font-medium">{booking.cancellation_reason}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(booking.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">{new Date(booking.updated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Financial */}
        <div className="space-y-6">
          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">TK {booking.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">TK {booking.paid_amount.toLocaleString()}</span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-TK {booking.discount_amount.toLocaleString()}</span>
                </div>
              )}
              {booking.paid_amount < booking.total_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding</span>
                  <span className="font-medium text-red-600">TK {(booking.total_amount - booking.paid_amount).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Download Invoice */}
              <Button 
                onClick={() => generateInvoice(booking)}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>

              {/* Make Payment */}
              {canMakePayment(booking) && (
                <Button 
                  onClick={handleMakePayment}
                  disabled={processingPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processingPayment ? 'Processing...' : 
                   `Pay TK ${(booking.total_amount - booking.paid_amount).toLocaleString()}`}
                </Button>
              )}

              {/* Cancel Booking */}
              {canCancelBooking(booking) && (
                <Button 
                  onClick={handleCancelBooking}
                  disabled={cancellingBooking}
                  variant="destructive"
                  className="w-full"
                >
                  {cancellingBooking ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              )}

              {/* Contact Support */}
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.open('mailto:support@vistavoyage.com', '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {booking.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name</span>
                  <span className="font-medium">{booking.user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <span className="font-medium">{booking.user.email}</span>
                </div>
                {booking.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </span>
                    <span className="font-medium">{booking.user.phone}</span>
                  </div>
                )}
                {(booking.user.city || booking.user.country) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </span>
                    <span className="font-medium">
                      {[booking.user.city, booking.user.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
