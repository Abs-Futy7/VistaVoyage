import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';


function AdminUserManagePage() {
    // Sample data for users
const users = [
  {
    id: "USR-001",
    name: "Marks Hoverson",
    email: "marks.h@example.com",
    joined: "12 May 2025",
    bookings: 5,
    status: "Active"
  },
  {
    id: "USR-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    joined: "03 Jun 2025",
    bookings: 2,
    status: "Active"
  },
  {
    id: "USR-003",
    name: "Michael Chen",
    email: "michael.c@example.com",
    joined: "17 Jun 2025",
    bookings: 0,
    status: "New"
  }
];
  return (
    <div>
     {/* Users Tab */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">User Management</h2>
              <p className="text-gray-500 mb-4">Manage user accounts and permissions</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search users..." className="pl-10 w-64" />
              </div>
              <button className="flex items-center text-sm bg-blue-600 hover:text-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pt-4 pl-6">User</th>
                      <th className="pb-3 pt-4">Email</th>
                      <th className="pb-3 pt-4">Joined</th>
                      <th className="pb-3 pt-4">Bookings</th>
                      <th className="pb-3 pt-4">Status</th>
                      <th className="pb-3 pt-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index} className="border-b border-gray-100 text-sm hover:bg-gray-50">
                        <td className="py-4 pl-6">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </td>
                        <td className="py-4">{user.email}</td>
                        <td className="py-4">{user.joined}</td>
                        <td className="py-4">{user.bookings}</td>
                        <td className="py-4">
                          <span 
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 
                              user.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-6">
                          <div className="flex justify-end space-x-2">
                            <button className="text-sm">Profile</button>
                            <button className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default AdminUserManagePage;
