"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminPackageForm } from '@/components/admin/AdminPackageFormNew';
import { useAdminDestinations, useAdminTripTypes, useAdminOffers } from '@/hooks/useAdmin';
import { adminService } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePackagePage() {
  const router = useRouter();
  const { destinations, loading: destinationsLoading } = useAdminDestinations();
  const { tripTypes, loading: tripTypesLoading } = useAdminTripTypes();
  const { offers, loading: offersLoading } = useAdminOffers();

  const handleSubmit = async (data: any, featuredImage?: File, galleryImages?: File[]) => {
    try {
      const formData = new FormData();
      
      // Add package data
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'available_from' || key === 'available_until') {
            formData.append(key, data[key].toISOString());
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      // Add featured image
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }

      // Add gallery images
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((image, index) => {
          formData.append(`gallery_image_${index}`, image);
        });
      }

      await adminService.createPackage(formData);
      toast.success('Package created successfully!');
      router.push('/admin/packages');
    } catch (error: any) {
      console.error('Failed to create package:', error);
      toast.error('Failed to create package', {
        description: error.message || 'Please try again'
      });
    }
  };

  const isLoading = destinationsLoading || tripTypesLoading || offersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/packages')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Create New Package</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPackageForm
            destinations={destinations}
            tripTypes={tripTypes}
            offers={offers}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/packages')}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
