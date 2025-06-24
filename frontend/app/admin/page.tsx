"use client";
import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  ShoppingBag, 
  Globe,
  Calendar, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  ChevronDown,
  Eye,
  Package,
  FileText,
  Tag,
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import PackagePage from './packages/page';
import AdminBlogManagePage from './blogs/page';
import AdminBookingManagePage from './bookings/page';
import AdminUserManagePage from './users/page';

export const travelAnalyticsSummary = [
  { 
    title: "Total Bookings", 
    value: "3,482", 
    change: "+11.4%", 
    changeData: "(+357 this month)",
    isPositive: true,
    icon: BookOpen,
    color: "#aed8f5" 
  },
  { 
    title: "Total Users", 
    value: "1,214", 
    change: "+4.2%", 
    changeData: "(+49 this week)",
    isPositive: true,
    icon: Users,
    color: "#ffe9cc"
  },
  { 
    title: "Popular Destination", 
    value: "Bali, Indonesia", 
    change: "Top 1", 
    changeData: "(342 bookings)",
    isPositive: true,
    icon: Globe,
    color: "#c1f7ec" 
  },
  { 
    title: "Active Packages", 
    value: "42",
    icon: Package,
    color: "#fad4de" 
  }
];




function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-8 gap-3 px-6">
      {/* Admin Welcome Card */}
      <div className="shadow-sm p-5 rounded-lg bg-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BarChart2 className="h-10 w-10 text-blue-600" />
            <div>
              <div className="text-2xl font-headline">Admin Dashboard</div>
              <div>Overview of site activity and management tools.</div>
            </div>
          </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-6">
        {travelAnalyticsSummary.map((item, index) => (
          <Card 
            key={index} 
            className="shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: item.color }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8 px-6">
        <PackagePage/>
        <AdminBlogManagePage/>
        <AdminBookingManagePage/>
        <AdminUserManagePage/>

      </div>
      </div>
  );
}

export default AdminDashboard;
