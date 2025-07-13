"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Calendar, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { adminService, DashboardStats } from '@/lib/api/services/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      
      // Ensure all data properties are properly initialized to prevent React rendering errors
      const safeData: DashboardStats = {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalPackages: data.totalPackages || 0,
        activePackages: data.activePackages || 0,
        totalBookings: data.totalBookings || 0,
        totalBlogs: data.totalBlogs || 0,
        publishedBlogs: data.publishedBlogs || 0,
        revenue: {
          total: data.revenue?.total || 0,
          thisMonth: data.revenue?.thisMonth || 0,
          lastMonth: data.revenue?.lastMonth || 0,
          growth: data.revenue?.growth || 0
        },
        bookingsByStatus: data.bookingsByStatus || {},
        recentBookings: data.recentBookings || [],
        recentUsers: data.recentUsers || [],
        recentBlogs: data.recentBlogs || []
      };
      
      setStats(safeData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Packages",
      value: stats.totalPackages,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Blogs",
      value: stats.totalBlogs,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-2xl font-bold">${stats.revenue?.total?.toLocaleString() || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-semibold">${stats.revenue?.thisMonth?.toLocaleString() || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-lg">${stats.revenue?.lastMonth?.toLocaleString() || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-semibold">{stats.revenue?.growth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.bookingsByStatus && Object.keys(stats.bookingsByStatus).length > 0 ? (
              Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        status === 'confirmed' ? 'default' :
                        status === 'pending' ? 'secondary' :
                        status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No booking data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest 5 bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{booking.customerName || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{booking.packageTitle || booking.packageId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${booking.totalAmount}</p>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent bookings available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest 5 registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent users available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
