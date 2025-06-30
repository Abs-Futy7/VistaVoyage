"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPackageForm } from '@/components/admin/AdminPackageFormNew';
import { useAdminDestinations, useAdminTripTypes, useAdminOffers } from '@/hooks/useAdmin';
import { adminService } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditPackagePageProps {
  params: Promise<{ id: string }>;
}

export default function EditPackagePage({ params }: EditPackagePageProps) {
  const router = useRouter();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = React.use(params);
  
  const { destinations, loading: destinationsLoading } = useAdminDestinations();
  const { tripTypes, loading: tripTypesLoading } = useAdminTripTypes();
  const { offers, loading: offersLoading } = useAdminOffers();

  useEffect(() => {
    fetchPackageData();
  }, [resolvedParams.id]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPackageById(resolvedParams.id);
      setPackageData(data);
    } catch (error: any) {
      console.error('Failed to fetch package data:', error);
      toast.error('Failed to load package data', {
        description: error.message || 'Please try again'
      });
      router.push('/admin/packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any, featuredImage?: File, galleryImages?: File[]) => {
    try {
      console.log('Form data received:', data);
      console.log('Featured image:', featuredImage);
      console.log('Gallery images:', galleryImages);
      
      // Create a clean package update object with all supported fields
      const packageUpdateData: any = {};
      
      // Basic required fields
      if (data.title !== undefined && data.title !== null && data.title !== '') {
        packageUpdateData.title = data.title.trim();
      }
      if (data.description !== undefined && data.description !== null && data.description !== '') {
        packageUpdateData.description = data.description.trim();
      }
      if (data.price !== undefined && data.price !== null && data.price !== '') {
        const priceValue = parseFloat(data.price.toString());
        if (!isNaN(priceValue) && priceValue > 0) {
          packageUpdateData.price = priceValue;
        }
      }
      if (data.duration_days !== undefined && data.duration_days !== null && data.duration_days !== '') {
        const daysValue = parseInt(data.duration_days.toString());
        if (!isNaN(daysValue) && daysValue > 0) {
          packageUpdateData.duration_days = daysValue;
        }
      }
      if (data.duration_nights !== undefined && data.duration_nights !== null && data.duration_nights !== '') {
        const nightsValue = parseInt(data.duration_nights.toString());
        if (!isNaN(nightsValue) && nightsValue >= 0) {
          packageUpdateData.duration_nights = nightsValue;
        }
      }
      if (data.destination_id !== undefined && data.destination_id !== null && data.destination_id !== '') {
        packageUpdateData.destination_id = data.destination_id;
      }
      if (data.trip_type_id !== undefined && data.trip_type_id !== null && data.trip_type_id !== '') {
        packageUpdateData.trip_type_id = data.trip_type_id;
      }
      if (data.offer_id !== undefined && data.offer_id !== null) {
        packageUpdateData.offer_id = data.offer_id === '' ? null : data.offer_id;
      }
      if (data.is_featured !== undefined && data.is_featured !== null) {
        packageUpdateData.is_featured = Boolean(data.is_featured);
      }
      if (data.is_active !== undefined && data.is_active !== null) {
        packageUpdateData.is_active = Boolean(data.is_active);
      }

      // Extended content fields
      if (data.highlights !== undefined && data.highlights !== null && data.highlights !== '') {
        packageUpdateData.highlights = data.highlights.trim();
      }
      if (data.itinerary !== undefined && data.itinerary !== null && data.itinerary !== '') {
        packageUpdateData.itinerary = data.itinerary.trim();
      }
      if (data.inclusions !== undefined && data.inclusions !== null && data.inclusions !== '') {
        packageUpdateData.inclusions = data.inclusions.trim();
      }
      if (data.exclusions !== undefined && data.exclusions !== null && data.exclusions !== '') {
        packageUpdateData.exclusions = data.exclusions.trim();
      }
      if (data.terms_conditions !== undefined && data.terms_conditions !== null && data.terms_conditions !== '') {
        packageUpdateData.terms_conditions = data.terms_conditions.trim();
      }
      
      // Detail fields
      if (data.max_group_size !== undefined && data.max_group_size !== null && data.max_group_size !== '') {
        const maxSize = parseInt(data.max_group_size.toString());
        if (!isNaN(maxSize) && maxSize > 0) {
          packageUpdateData.max_group_size = maxSize;
        }
      }
      if (data.min_age !== undefined && data.min_age !== null && data.min_age !== '') {
        const minAge = parseInt(data.min_age.toString());
        if (!isNaN(minAge) && minAge >= 0) {
          packageUpdateData.min_age = minAge;
        }
      }
      if (data.difficulty_level !== undefined && data.difficulty_level !== null && data.difficulty_level !== '') {
        packageUpdateData.difficulty_level = data.difficulty_level;
      }
      
      // Date fields
      if (data.available_from !== undefined && data.available_from !== null) {
        if (data.available_from instanceof Date) {
          packageUpdateData.available_from = data.available_from.toISOString().split('T')[0];
        } else if (typeof data.available_from === 'string' && data.available_from !== '') {
          packageUpdateData.available_from = data.available_from;
        }
      }
      if (data.available_until !== undefined && data.available_until !== null) {
        if (data.available_until instanceof Date) {
          packageUpdateData.available_until = data.available_until.toISOString().split('T')[0];
        } else if (typeof data.available_until === 'string' && data.available_until !== '') {
          packageUpdateData.available_until = data.available_until;
        }
      }

      console.log('Processed package data:', packageUpdateData);

      // Use the admin service to update the package with gallery images
      await adminService.updatePackageWithGallery(resolvedParams.id, packageUpdateData, featuredImage, galleryImages);
      toast.success('Package updated successfully!');
      router.push('/admin/packages');
    } catch (error: any) {
      console.error('Failed to update package:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to update package', {
        description: error.response?.data?.detail || error.message || 'Please try again'
      });
    }
  };

  const isLoading = loading || destinationsLoading || tripTypesLoading || offersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading package data...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">The package you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/admin/packages')}>
            Back to Packages
          </Button>
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
            <Edit className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Edit Package</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPackageForm
            initialData={packageData}
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
