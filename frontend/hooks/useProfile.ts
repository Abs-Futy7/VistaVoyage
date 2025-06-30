"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/lib/api';
import { User, UserUpdateModel, ApiError } from '@/lib/api/types';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile with debugging
  const updateProfile = async (userData: UserUpdateModel): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Log what we're sending to help debug
      console.log('Updating profile with data:', userData);
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return true;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const apiError = error as ApiError;
      
      // Enhanced error logging for debugging
      console.log('Full error object:', error);
      console.log('Error status:', apiError.status);
      console.log('Error errors array:', apiError.errors);
      
      // For 422 validation errors, show detailed error message
      let errorMessage = apiError.message || 'Failed to update profile';
      if (apiError.status === 422 && apiError.errors && apiError.errors.length > 0) {
        errorMessage = `Validation Error: ${apiError.errors.join(', ')}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    user,
    isLoading,
    isUpdating,
    error,
    fetchProfile,
    updateProfile,
    clearError: () => setError(null)
  };
}
