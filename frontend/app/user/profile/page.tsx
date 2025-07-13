"use client";
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Edit3, UserCircle, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/hooks/useProfile'
import { toast } from 'sonner'


function ProfilePage() {
  const { user, isLoading, isUpdating, error, updateProfile, clearError } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    passport: ''
  });

  // Update form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        passport: user.passport || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation to match backend constraints
    const errors: string[] = [];
    
    if (formData.full_name.trim().length === 0) {
      errors.push("Full name cannot be empty");
    }
    if (formData.full_name.length > 255) {
      errors.push("Full name must be less than 255 characters");
    }
    
    if (formData.email && formData.email.length > 30) {
      errors.push("Email must be less than 30 characters");
    }
    
    if (formData.passport.trim().length === 0) {
      errors.push("Passport number cannot be empty");
    }
    if (formData.passport.length > 255) {
      errors.push("Passport number must be less than 255 characters");
    }
    
    if (errors.length > 0) {
      toast.error("Validation Error", { 
        description: errors.join(", ")
      });
      return;
    }
    
    // Send all user data with changes applied to avoid missing required fields
    const updateData: any = {};
    
    if (user) {
      // Always include required fields with current or updated values
      updateData.full_name = formData.full_name.trim();
      updateData.email = formData.email.trim();
      updateData.passport = formData.passport.trim();
      
      // Only include optional fields if they have values
      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
    }

    console.log("Submitting update data:", updateData);
    
    const success = await updateProfile(updateData);
    if (success) {
      toast.success("Profile Updated", { description: "Your profile has been successfully updated." });
    } else {
      toast.error("Update Failed", { description: error || "Failed to update profile. Please try again." });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm shadow-blue-500/50 border-1 border-blue-400 rounded-lg max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !user) {
    return (
      <Card className="shadow-sm shadow-red-500/50 border-1 border-red-400 rounded-lg max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="mt-2 text-gray-600">Failed to load profile</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-sm shadow-blue-500/50 border-1 border-blue-400 rounded-lg max-w-3xl mx-auto">
      <CardHeader className="border-b border-blue-400">
        <div className="flex items-center space-x-4">
            <UserCircle className="h-10 w-10 text-blue-500" />
            <div>
                <CardTitle className="text-2xl font-headline text-gray-800">My Profile</CardTitle>
                <CardDescription>View and manage your personal information.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 justify-center">
            <Avatar className="h-32 w-32 border-4 border-blue-500 shadow-md">
                <AvatarImage src="/images/Sample_User_Icon.png" alt={user?.full_name || 'User'} data-ai-hint="person profile"/>
                <AvatarFallback className="text-4xl">
                  {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
                <h2 className="text-3xl font-headline font-semibold text-foreground">{user?.full_name || 'Loading...'}</h2>
                <p className="text-muted-foreground">{user?.email || 'Loading...'}</p>
                <p className="text-muted-foreground">{user?.phone || "No phone number provided"}</p>
                <button className="mt-4 flex items-center text-primary hover:text-primary/80 transition-colors cursor-pointer bg-blue-200 px-3 py-2 rounded-lg border border-blue-300 hover:bg-blue-300/50">
                    <Edit3 className="mr-2 h-4 w-4 " /> Change Profile Picture
                </button>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="full_name" className="text-base">Full Name <span className="text-red-500">*</span></label>
                <Input 
                  id="full_name" 
                  value={formData.full_name} 
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">Required (max 255 characters)</p>
            </div>
            <div>
                <label htmlFor="email" className="text-base">Email Address <span className="text-red-500">*</span></label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"
                  required
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">Required (max 30 characters) - {formData.email.length}/30</p>
            </div>
            <div>
                <label htmlFor="phone" className="text-base">Phone Number</label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"
                />
                <p className="text-xs text-gray-500 mt-1">Optional</p>
            </div>
            {/* Removed city and country fields as per backend model */}
            <div>
                <label htmlFor="passport" className="text-base">Passport Number <span className="text-red-500">*</span></label>
                <Input 
                  id="passport" 
                  value={formData.passport} 
                  onChange={(e) => handleInputChange('passport', e.target.value)}
                  className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">Required (max 255 characters)</p>
            </div>
             
            <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-green-200 px-4 py-2 rounded-lg text-green-800 border border-green-600 hover:bg-green-300/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
            </div>
        </form>

      </CardContent>
    </Card>
  )
}

export default ProfilePage
