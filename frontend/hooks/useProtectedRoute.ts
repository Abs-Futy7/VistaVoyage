"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();

  const checkAuthAndShowDialog = (message?: string) => {
    if (isLoading) return false; // Still checking auth status
    
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return false;
    }
    
    return true;
  };

  const handleCloseDialog = () => {
    setShowLoginDialog(false);
  };

  const redirectToLogin = (returnUrl?: string) => {
    setShowLoginDialog(false);
    const url = returnUrl ? `/auth/login?return=${encodeURIComponent(returnUrl)}` : '/auth/login';
    router.push(url);
  };

  return {
    isAuthenticated,
    isLoading,
    showLoginDialog,
    checkAuthAndShowDialog,
    handleCloseDialog,
    redirectToLogin
  };
}
