"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  message = "You need to login to access this page",
  redirectTo = "/auth/login",
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Checking authentication...</p>
    </div>
  </div>
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Listen for auth:loginRequired events from API client
    const handleLoginRequired = (event: CustomEvent) => {
      setShowLoginDialog(true);
    };

    window.addEventListener('auth:loginRequired', handleLoginRequired as EventListener);
    
    return () => {
      window.removeEventListener('auth:loginRequired', handleLoginRequired as EventListener);
    };
  }, []);

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Show login dialog if not authenticated
  if (!isAuthenticated && showLoginDialog) {
    return (
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={handleCloseDialog}
        message={message}
        redirectTo={`${redirectTo}?return=${encodeURIComponent(pathname)}`}
      />
    );
  }

  // Show content if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Default fallback
  return <>{fallback}</>;
}
