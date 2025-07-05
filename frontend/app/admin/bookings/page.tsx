"use client";
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useAdminBookings } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

function AdminBookingManagePage() {
  const { bookings, loading, error, updateBookingStatus, search, filterByStatus, refetch } = useAdminBookings();
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await updateBookingStatus(bookingId, newStatus);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterByStatus(status === 'All' ? '' : status.toLowerCase());
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Booking Management</h2>
            <p className="text-gray-500">Overview and details of all customer bookings</p>
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                    <th className="pb-3 pt-4 pl-6">Booking ID</th>
                    <th className="pb-3 pt-4">Package</th>
                    <th className="pb-3 pt-4">Customer</th>
                    <th className="pb-3 pt-4">Date</th>
                    <th className="pb-3 pt-4">Amount</th>
                    <th className="pb-3 pt-4">Status</th>
                    <th className="pb-3 pt-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 pl-6"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="py-4 text-right pr-6"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error loading bookings</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Bookings Tab */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Booking Management</h2>
          <p className="text-gray-500">Overview and details of all customer bookings</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search bookings..." 
              className="pl-10 w-64" 
              onChange={(e) => search(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'].map((status) => (
              <Button 
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className={statusFilter === status ? "bg-blue-500 text-white" : ""}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-3 pt-4 pl-6">Booking ID</th>
                  <th className="pb-3 pt-4">Package</th>
                  <th className="pb-3 pt-4">Customer</th>
                  <th className="pb-3 pt-4">Date</th>
                  <th className="pb-3 pt-4">Amount</th>
                  <th className="pb-3 pt-4">Status</th>
                  <th className="pb-3 pt-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings && bookings.length > 0 ? (
                  bookings.map((booking: any, index: number) => (
                    <tr key={booking.id || index} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                      <td className="py-4 pl-6 font-medium">{booking.id}</td>
                      <td className="py-4">{booking.packageTitle || 'N/A'}</td>
                      <td className="py-4">{booking.user?.fullName || 'N/A'}</td>
                      <td className="py-4">
                        {booking.created_at ? 
                          new Date(booking.created_at).toLocaleDateString() : 
                          'N/A'
                        }
                      </td>
                      <td className="py-4 font-medium">${booking.total_amount?.toLocaleString() || 0}</td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                            'bg-red-100 text-red-700 border-red-200'
                          }
                        >
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(booking.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Details
                          </Button>
                          {booking.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminBookingManagePage;
