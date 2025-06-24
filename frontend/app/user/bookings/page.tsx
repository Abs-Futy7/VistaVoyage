import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, ListOrdered } from 'lucide-react'
import { mockUserBookings } from '@/utils/contants'


function MyBookingPage() {
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
        {mockUserBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full ">
              <TableHeader>
                <TableRow className="bg-blue-100 text-blue-800 font-semibold">
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Travel Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUserBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                        <Link href={`/packages/${booking.packageId}`} className="hover:text-accent hover:underline">
                            {booking.packageName}
                        </Link>
                    </TableCell>
                    <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        booking.status === "Confirmed" ? "default" :
                        booking.status === "Pending" ? "secondary" :
                        booking.status === "Completed" ? "outline" : // Using outline for completed to differentiate
                        "destructive" // For cancelled or other states
                      }
                      className={
                        booking.status === "Confirmed" ? "bg-green-500 text-white" :
                        booking.status === "Pending" ? "bg-yellow-500 text-black" :
                        booking.status === "Completed" ? "border-blue-500 text-blue-500" : ""
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${booking.total.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <button title="View Details">
                           <Link href={`/dashboard/user/bookings/${booking.id}`}>
                            <Eye className="h-4 w-4" />
                           </Link>
                        </button>
                        <button  title="Download Invoice">
                            <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">You haven't made any bookings yet.</p>
            <button className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/packages">Explore Packages</Link>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MyBookingPage