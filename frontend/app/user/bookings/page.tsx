"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Eye, ListOrdered, AlertCircle, Filter, X, CreditCard, AlertTriangle } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Invoice generation function
const generateInvoice = (booking: any) => {
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) {
    toast.error('Please allow popups to download invoice');
    return;
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${booking.id}</title>
      <style>
        @page {
          size: A4;
          margin: 0.5in;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.3;
          color: #333;
          font-size: 12px;
          margin: 0;
          padding: 0;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 3px;
        }
        .company-tagline {
          color: #666;
          font-size: 11px;
        }
        .invoice-title {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0 5px 0;
          color: #1f2937;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .invoice-details, .booking-details {
          background: #f8fafc;
          padding: 8px;
          border-radius: 4px;
          width: 48%;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .detail-label {
          font-weight: bold;
          color: #4b5563;
        }
        .section-title {
          margin-top: 0;
          margin-bottom: 6px;
          color: #374151;
          font-size: 13px;
        }
        .package-info {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
          padding: 10px;
          margin: 10px 0;
        }
        .package-title {
          font-size: 14px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .amount-breakdown {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          padding: 2px 0;
          font-size: 11px;
        }
        .amount-row.total {
          border-top: 1px solid #3b82f6;
          padding-top: 6px;
          margin-top: 6px;
          font-weight: bold;
          font-size: 13px;
          color: #1f2937;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-confirmed { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-completed { background: #dbeafe; color: #1e40af; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }
        .payment-paid { background: #dcfce7; color: #166534; }
        .payment-pending { background: #fed7aa; color: #c2410c; }
        .payment-partially { background: #dbeafe; color: #1e40af; }
        .payment-section {
          margin: 10px 0;
        }
        .footer {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 9px;
          line-height: 1.2;
        }
        .print-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          margin: 5px 3px;
        }
        .print-button:hover {
          background: #2563eb;
        }
        .button-section {
          text-align: center;
          margin: 10px 0;
        }
        @media print {
          .print-button, .button-section { display: none !important; }
          body { margin: 0; padding: 0; }
          .header { margin-bottom: 10px; }
          .invoice-info { margin-bottom: 10px; }
          .package-info { margin: 8px 0; }
          .amount-breakdown { margin: 8px 0; }
          .payment-section { margin: 8px 0; }
          .footer { margin-top: 10px; padding-top: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">VistaVoyage</div>
        <div class="company-tagline">Your Gateway to Amazing Adventures</div>
        <div class="invoice-title">INVOICE</div>
      </div>

      <div class="invoice-info">
        <div class="invoice-details">
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

        <div class="booking-details">
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

      <div class="payment-section">
        <h3 class="section-title">Payment Status</h3>
        <span class="status-badge payment-${booking.payment_status.replace('_', '')}">${booking.payment_status === 'partially_paid' ? 'Partially Paid' : booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}</span>
      </div>

      <div class="button-section">
        <button class="print-button" onclick="window.print()">Print Invoice</button>
        <button class="print-button" onclick="window.close()">Close</button>
      </div>

      <div class="footer">
        <p><strong>VistaVoyage</strong> | Email: support@vistavoyage.com | Phone: +880-1234-567890</p>
        <p>Thank you for choosing VistaVoyage for your travel adventure!</p>
        <p><em>This is a computer-generated invoice. For any queries, please contact our support team.</em></p>
      </div>
    </body>
    </html>
  `;

  invoiceWindow.document.write(invoiceHTML);
  invoiceWindow.document.close();
};


function MyBookingPage() {
  const { bookings, loading, error, pagination, filterByStatus, cancelBooking, makePayment, refetch } = useBookings();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<{ [key: string]: boolean }>({});

  // Debug logging
  console.log('Bookings data:', bookings);
  console.log('Available functions:', { cancelBooking, makePayment });
  
  // Debug each booking to see what fields are available
  if (bookings && bookings.length > 0) {
    console.log('First booking data:', bookings[0]);
    console.log('Package title exists:', bookings[0].packageTitle);
    console.log('All booking keys:', Object.keys(bookings[0]));
  }

  // Only use real bookings data
  const displayBookings = bookings;

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterByStatus(status === 'all' ? undefined : status);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId);
    try {
      const success = await cancelBooking(bookingId);
      if (success) {
        toast.success('Booking cancelled successfully');
        setDialogOpen(prev => ({ ...prev, [bookingId]: false }));
        refetch(); // Refresh the bookings list
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingBooking(null);
    }
  };

  const handleMakePayment = async (bookingId: string, amount: number) => {
    console.log('Making payment for booking:', bookingId, 'amount:', amount);
    
    if (amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }
    
    setProcessingPayment(bookingId);
    try {
      const success = await makePayment(bookingId, amount);
      if (success) {
        toast.success('Payment processed successfully');
        refetch(); // Refresh the bookings list
      } else {
        toast.error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  const canCancelBooking = (booking: any) => {
    console.log('Checking cancel booking for:', booking.id, 'status:', booking.status);
    // Can only cancel pending or confirmed bookings, not completed ones
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  const canMakePayment = (booking: any) => {
    console.log('Checking payment for:', booking.id, 'payment_status:', booking.payment_status, 'status:', booking.status);
    // Can make payment if payment is pending or partially paid AND booking is active (pending or confirmed)
    return (booking.payment_status === 'pending' || booking.payment_status === 'partially_paid') && 
           (booking.status === 'pending' || booking.status === 'confirmed') &&
           booking.status !== 'cancelled' && 
           booking.status !== 'refunded' &&
           booking.status !== 'completed' &&
           booking.paid_amount < booking.total_amount;
  };

  // Loading state
  if (loading) {
    return (
      <Card className="shadow-sm shadow-blue-400/50 mx-auto border border-blue-200 mt-10">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center space-x-4">
            <ListOrdered className="h-10 w-10 text-blue-500" />
            <div>
              <CardTitle className="text-2xl font-headline">My Bookings</CardTitle>
              <CardDescription>View and manage your travel bookings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-sm shadow-blue-400/50 mx-auto border border-blue-200 mt-10">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center space-x-4">
            <ListOrdered className="h-10 w-10 text-blue-500" />
            <div>
              <CardTitle className="text-2xl font-headline">My Bookings</CardTitle>
              <CardDescription>View and manage your travel bookings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Failed to load bookings</p>
            <p className="text-sm text-red-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm shadow-blue-400/50 mx-auto border border-blue-200 mt-10 ">
      <CardHeader className="border-b border-blue-200">
        <div className="flex items-center space-x-4">
            <ListOrdered className="h-10 w-10 text-blue-500" />
            <div>
                <CardTitle className="text-2xl font-headline">My Bookings</CardTitle>
                <CardDescription>View and manage your travel bookings.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        {/* Filter buttons */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className={statusFilter === status ? "bg-blue-500 text-white" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
          {pagination.total > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {bookings.length} of {pagination.total} bookings
            </div>
          )}
        </div>

        {displayBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full ">
              <TableHeader>
                <TableRow className="bg-blue-100 text-blue-800 font-semibold">
                  <TableHead>Package</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {booking.packageTitle ? (
                        <div>
                          <Link 
                            href={`/packages/${booking.package_id}`} 
                            className="hover:text-blue-600 hover:underline font-medium"
                          >
                            {booking.packageTitle}
                          </Link>
                          {booking.packagePrice && (
                            <div className="text-sm text-gray-500">
                              TK {booking.packagePrice} per person
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Link 
                            href={`/packages/${booking.package_id}`} 
                            className="hover:text-blue-600 hover:underline font-medium"
                          >
                            Package #{booking.package_id.substring(0, 8)}...
                          </Link>
                          <div className="text-xs text-gray-400 mt-1">
                            Package details not loaded
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={
                          booking.status === "confirmed" ? "default" :
                          booking.status === "pending" ? "secondary" :
                          booking.status === "completed" ? "outline" :
                          "destructive"
                        }
                        className={
                          booking.status === "confirmed" ? "bg-green-500 text-white" :
                          booking.status === "pending" ? "bg-yellow-500 text-black" :
                          booking.status === "completed" ? "border-blue-500 text-blue-500" : ""
                        }>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {canCancelBooking(booking) && (
                          <div className="text-xs text-gray-500 mt-1">
                            Can be cancelled
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={
                          booking.payment_status === "paid" ? "default" :
                          booking.payment_status === "partially_paid" ? "secondary" :
                          booking.payment_status === "pending" ? "secondary" :
                          "destructive"
                        }
                        className={
                          booking.payment_status === "paid" ? "bg-green-500 text-white" :
                          booking.payment_status === "partially_paid" ? "bg-blue-500 text-white" :
                          booking.payment_status === "pending" ? "bg-orange-500 text-white" :
                          "bg-red-500 text-white"
                        }>
                          {booking.payment_status === "partially_paid" ? "Partially Paid" : 
                           booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </Badge>
                        {(booking.payment_status === "pending" || booking.payment_status === "partially_paid") && canMakePayment(booking) && (
                          <div className="text-xs text-orange-600 mt-1">
                            {booking.payment_status === "partially_paid" ? 
                              `TK ${(booking.total_amount - booking.paid_amount).toLocaleString()} remaining` : 
                              'Payment required'
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-right">
                        <div className="font-medium">TK {booking.total_amount.toLocaleString()}</div>
                        {booking.discount_amount > 0 && (
                          <div className="text-sm text-green-600">
                            -TK {booking.discount_amount.toLocaleString()} discount
                          </div>
                        )}
                        {booking.paid_amount > 0 && booking.paid_amount !== booking.total_amount && (
                          <div className="text-sm text-blue-600">
                            TK {booking.paid_amount.toLocaleString()} paid
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        {/* View Details Button */}
                        <Link href={`/user/bookings/${booking.id}`} title="View Details">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        {/* Download Invoice Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Download Invoice"
                          onClick={() => generateInvoice(booking)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Make Payment Button */}
                        {canMakePayment(booking) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={`Pay remaining TK ${(booking.total_amount - booking.paid_amount).toLocaleString()}`}
                            onClick={() => handleMakePayment(booking.id, booking.total_amount - booking.paid_amount)}
                            className="text-green-600 hover:text-green-700"
                            disabled={processingPayment === booking.id}
                          >
                            {processingPayment === booking.id ? (
                              <AlertTriangle className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {/* Cancel Booking Button */}
                        {canCancelBooking(booking) && (
                          <AlertDialog 
                            open={dialogOpen[booking.id] || false}
                            onOpenChange={(open) => setDialogOpen(prev => ({ ...prev, [booking.id]: open }))}
                          >
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Cancel Booking"
                                className="text-red-600 hover:text-red-700"
                                disabled={cancellingBooking === booking.id}
                              >
                                {cancellingBooking === booking.id ? (
                                  <AlertTriangle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this booking for "{booking.packageTitle || 'this package'}"? 
                                  This action cannot be undone and you may be subject to cancellation fees.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel 
                                  onClick={() => setDialogOpen(prev => ({ ...prev, [booking.id]: false }))}
                                >
                                  Keep Booking
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={cancellingBooking === booking.id}
                                >
                                  {cancellingBooking === booking.id ? (
                                    <>
                                      <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    'Cancel Booking'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <ListOrdered className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">You haven't made any bookings yet.</p>
            <p className="text-sm text-gray-500 mb-6">Start exploring our amazing travel packages and create your first booking!</p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/packages">Explore Packages</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProtectedMyBookingPage() {
  return (
    <ProtectedRoute message="Please log in to view your bookings">
      <MyBookingPage />
    </ProtectedRoute>
  );
}