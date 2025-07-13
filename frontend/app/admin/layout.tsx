"use client";
import { 
  BarChart2, 
  BookOpen, 
  FileText, 
  LogOut, 
  Package, 
  Shield, 
  Tag, 
  Users, 
  ChevronRight, 
  Bell, 
  Settings,
  MapPin,
  Gift,
  UserPlus,
  Map
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Toaster } from 'sonner';
import { adminAuthService, AdminModel } from '@/lib/api/services/admin-auth';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog as ProfileDialog, DialogContent as ProfileDialogContent, DialogHeader as ProfileDialogHeader, DialogTitle as ProfileDialogTitle } from '@/components/ui/dialog';

function AdminLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  // For profile editing, use a separate state to avoid direct mutation of currentAdmin
  const [profileEdit, setProfileEdit] = useState<{ full_name: string; email: string }>({
    full_name: '',
    email: ''
  });

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_access_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const admin = await adminAuthService.getCurrentAdmin();
        setCurrentAdmin(admin);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('admin_access_token');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await adminAuthService.logout();
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      setCurrentAdmin(null);
      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      setCurrentAdmin(null);
      router.push('/admin/login');
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setCreateLoading(true);
      await adminAuthService.createAdmin(newAdmin);
      toast.success('Admin created successfully');
      setIsCreateAdminOpen(false);
      setNewAdmin({
        username: '',
        full_name: '',
        email: '',
        password: '',
        role: 'admin'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setCreateLoading(false);
    }
  };

  // Show login page without layout
  if (isLoginPage) {
    return children;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handles this)
  if (!currentAdmin) {
    return null;
  }

  const adminSidebarNavItems = [
    { title: "Dashboard", href: "/admin/dashboard", icon: BarChart2 },
    { title: "Packages", href: "/admin/packages", icon: Package },
    { title: "Blogs", href: "/admin/blogs", icon: FileText },
    { title: "Bookings", href: "/admin/bookings", icon: BookOpen },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Destinations", href: "/admin/destinations", icon: MapPin },
    { title: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
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
        
        <div className="mt-auto px-3 pb-6 space-y-2">
          {/* Create Admin Button */}
          <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
            <DialogTrigger asChild>
              <button className="flex w-full items-center px-3 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                <UserPlus className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Create Admin</span>}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newAdmin.full_name}
                    onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="admin_email">Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="admin_password">Password</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateAdminOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAdmin} disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create Admin'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
          >
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
            <h1 className="text-xl font-medium text-gray-800">Welcome Back, {currentAdmin?.full_name || 'Admin'}!</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-800">{currentAdmin?.full_name}</p>
                    <p className="text-gray-600 capitalize">{currentAdmin?.role}</p>
                  </div>
                  <Avatar>
                    <AvatarImage src="/images/avatar.png" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {currentAdmin?.full_name?.split(' ').map(n => n[0]).join('') || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>Change Password</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Profile Modal */}
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen}>
          <ProfileDialogContent className="max-w-xl">
            <ProfileDialogHeader>
              <ProfileDialogTitle>My Profile</ProfileDialogTitle>
            </ProfileDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile_full_name">Full Name</Label>
                <Input
                  id="profile_full_name"
                  value={profileEdit.full_name}
                  onChange={e => setProfileEdit({ ...profileEdit, full_name: e.target.value })}
                  disabled={!currentAdmin}
                />
              </div>
              <div>
                <Label htmlFor="profile_email">Email</Label>
                <Input
                  id="profile_email"
                  type="email"
                  value={profileEdit.email}
                  onChange={e => setProfileEdit({ ...profileEdit, email: e.target.value })}
                  disabled={!currentAdmin}
                />
              </div>
              <div>
                <Label htmlFor="profile_username">Username</Label>
                <Input
                  id="profile_username"
                  value={currentAdmin?.username || ''}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="profile_role">Role</Label>
                <Input
                  id="profile_role"
                  value={currentAdmin?.role || ''}
                  disabled
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    try {
                      await adminAuthService.updateProfile({
                        full_name: profileEdit.full_name,
                        email: profileEdit.email
                      });
                      // Refetch admin info after update
                      const updated = await adminAuthService.getCurrentAdmin();
                      setCurrentAdmin(updated);
                      setProfileEdit({
                        full_name: updated.full_name,
                        email: updated.email
                      });
                      toast.success('Profile updated successfully');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to update profile');
                    }
                  }}
                  disabled={!currentAdmin}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </ProfileDialogContent>
        </ProfileDialog>
        {/* Change Password Modal (placeholder) */}
        <ProfileDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <ProfileDialogContent className="max-w-md">
            <ProfileDialogHeader>
              <ProfileDialogTitle>Change Password</ProfileDialogTitle>
            </ProfileDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" />
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
                <Button>Change Password</Button>
              </div>
            </div>
          </ProfileDialogContent>
        </ProfileDialog>
        {/* Page Content */}
        <div className="p-6">
          {/* Admin Info Section removed from here */}
          {children}
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default AdminLayout;
