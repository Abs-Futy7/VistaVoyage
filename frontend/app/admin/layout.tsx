"use client";
import { BarChart2, BookOpen, FileText, LogOut, Package, Shield, Tag, Users, ChevronRight, Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

function AdminLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const adminSidebarNavItems = [
    { title: "Dashboard", href: "/admin", icon: BarChart2 },
    { title: "Packages", href: "/admin/packages", icon: Package },
    { title: "Blogs", href: "/admin/blogs", icon: FileText },
    { title: "Bookings", href: "/admin/bookings", icon: BookOpen },
    { title: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-[#121212] text-white ${collapsed ? 'w-22' : 'w-62'} transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-2 flex items-center border-b border-gray-800">
          <Image src="/icons/logo.png" width={80} height={90} alt="VoyageVista Logo" className={` ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span className="font-bold text-lg">VoyageVista</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="ml-auto text-gray-600 hover:text-white "
          >
            <ChevronRight className={`h-5 w-5 transition-all duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className="mt-6 px-3">
          {!collapsed && <h3 className="text-xs text-gray-400 uppercase font-medium tracking-wider px-3 mb-3">General</h3>}
          <nav className="space-y-1">
            {adminSidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center px-3 py-3 cursor-pointer rounded-md transition-colors ${
                    isActive 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
                  {!collapsed && <span className="ml-4 justify-center">{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto px-3 pb-6">
          <button className="flex w-full items-center px-3 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-60'} transition-all duration-300 overflow-auto`}>
        {/* Top Navigation */}
        <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="text-xl font-medium text-gray-800">Welcome Back, Admin!</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/images/avatar.png" />
                <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
