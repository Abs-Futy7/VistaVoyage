"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      // Redirect to the main dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
