import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart2, Package, FileText, BookOpen, Users, LogOut, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function AdminBookingManagePage() {
    // Sample data for bookings
const recentOrders = [
  {
    id: "#BK-8441",
    product: "Bali Adventure Package",
    customer: "Peterson Jack",
    date: "27 Jun 2025",
    amount: "$1,299",
    status: "Confirmed"
  },
  {
    id: "#BK-2657",
    product: "Paris Getaway",
    customer: "Michel Datta",
    date: "26 Jun 2025",
    amount: "$1,899",
    status: "Pending"
  },
  {
    id: "#BK-1024",
    product: "Tokyo Explorer",
    customer: "Jesiya Rose",
    date: "20 Jun 2025",
    amount: "$2,499",
    status: "Cancelled"
  }
];
  return (
    
    <div>
      {/* Bookings Tab */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Booking Management</h2>
              <p className="text-gray-500">Overview and details of all customer bookings</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search bookings..." className="pl-10 w-64" />
              </div>
              <div className="flex space-x-2">
                <button className="border-r rounded-lg bg-blue-500 text-white px-3 py-2">All</button>
                <button className="border-r rounded-lg bg-blue-500 text-white px-3 py-2">Confirmed</button>
                <button className="border-r rounded-lg bg-blue-500 text-white px-3 py-2">Pending</button>
                <button className="rounded-lg bg-blue-500 text-white px-3 py-2">Cancelled</button>
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
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                        <td className="py-4 pl-6 font-medium">{order.id}</td>
                        <td className="py-4">{order.product}</td>
                        <td className="py-4">{order.customer}</td>
                        <td className="py-4">{order.date}</td>
                        <td className="py-4 font-medium">{order.amount}</td>
                        <td className="py-4">
                          <span 
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-6">
                          <div className="flex justify-end space-x-2">
                            <button className="text-sm" >Details</button>
                            {order.status === 'Pending' && (
                              <button className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50">
                                Confirm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* End Recent Bookings */}
    </div>
  )
}

export default AdminBookingManagePage;
