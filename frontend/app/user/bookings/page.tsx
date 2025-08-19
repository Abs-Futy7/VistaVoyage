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
                              ${booking.packagePrice} per person
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
                              `$${(booking.total_amount - booking.paid_amount).toLocaleString()} remaining` : 
                              'Payment required'
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-right">
                        <div className="font-medium">${booking.total_amount.toLocaleString()}</div>
                        {booking.discount_amount > 0 && (
                          <div className="text-sm text-green-600">
                            -${booking.discount_amount.toLocaleString()} discount
                          </div>
                        )}
                        {booking.paid_amount > 0 && booking.paid_amount !== booking.total_amount && (
                          <div className="text-sm text-blue-600">
                            ${booking.paid_amount.toLocaleString()} paid
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
                        <Button variant="ghost" size="sm" title="Download Invoice">
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Make Payment Button */}
                        {canMakePayment(booking) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={`Pay remaining $${(booking.total_amount - booking.paid_amount).toLocaleString()}`}
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