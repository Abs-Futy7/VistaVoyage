"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService, AdminDestinationDetail } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Clock, 
  Calendar,
  Package2,
  Star,
  Eye,
  Edit,
  Image as ImageIcon
} from 'lucide-react';

export default function DestinationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [destination, setDestination] = useState<AdminDestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const destinationId = params.id;

  useEffect(() => {
    fetchDestinationDetails();
  }, [destinationId]);

  const fetchDestinationDetails = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDestinationDetails(destinationId);
      setDestination(data);
    } catch (error: any) {
      console.error('Failed to fetch destination details:', error);
      toast.error('Failed to load destination details', {
        description: error.message || 'Please try again'
      });
      router.push('/admin/destinations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Destination Not Found</h2>
          <p className="text-gray-600 mb-4">The destination you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/destinations')}>
            Back to Destinations
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/destinations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Destinations
          </Button>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{destination.name}</h1>
            <Badge variant={destination.is_active ? "default" : "secondary"}>
              {destination.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/destinations/edit/${destination.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Destination
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Destination Name</h3>
                  <p className="text-lg font-semibold">{destination.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Country</h3>
                  <p className="text-lg">{destination.country}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">City</h3>
                  <p className="text-lg">{destination.city}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
                  <p className="text-lg">{destination.timezone || 'Not specified'}</p>
                </div>
              </div>
              
              {destination.description && (
                <>
                  <div className="h-[1px] w-full bg-gray-200 my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{destination.description}</p>
                  </div>
                </>
              )}

              {destination.best_time_to_visit && (
                <>
                  <div className="h-[1px] w-full bg-gray-200 my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Best Time to Visit
                    </h3>
                    <p className="text-gray-700">{destination.best_time_to_visit}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          {destination.featured_image && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={destination.featured_image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Statistics & Meta */}
        <div className="space-y-6">
          {/* Package Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package2 className="h-5 w-5 mr-2" />
                Package Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Package2 className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Total Packages</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {destination.total_packages}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Active Packages</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {destination.active_packages}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Featured Packages</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    {destination.featured_packages}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge variant={destination.is_active ? "default" : "secondary"} className="mt-1">
                  {destination.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="h-[1px] w-full bg-gray-200 my-4" />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-sm text-gray-700">{formatDate(destination.created_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-sm text-gray-700">{formatDate(destination.updated_at)}</p>
              </div>
              
              <div className="h-[1px] w-full bg-gray-200 my-4" />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Destination ID</h3>
                <p className="text-sm text-gray-700 font-mono break-all">{destination.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/admin/destinations/edit/${destination.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Destination
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/admin/packages?destination=${destination.id}`)}
              >
                <Package2 className="h-4 w-4 mr-2" />
                View Packages
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/destinations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
