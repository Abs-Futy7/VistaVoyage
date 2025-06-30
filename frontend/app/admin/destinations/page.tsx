"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Eye, 
  Trash2, 
  Edit,
  Loader2,
  AlertCircle,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  Clock,
  Globe
} from 'lucide-react';
import { useAdminDestinations } from '@/hooks/useAdmin';
import { AdminForm } from '@/components/ui/admin-form';
import { AdminDestination } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminDestinationsPage() {
  const {
    destinations,
    loading,
    error,
    pagination,
    fetchDestinations,
    deleteDestination,
    createDestination,
    updateDestination,
    search,
    searchTerm,
  } = useAdminDestinations();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<AdminDestination | null>(null);
  const [copiedDestinationId, setCopiedDestinationId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullUrl = `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    console.log('Constructed image URL:', fullUrl, 'from path:', imagePath);
    return fullUrl;
  };

  // Handle image load errors
  const handleImageError = (destinationId: string) => {
    setImageErrors(prev => new Set(prev).add(destinationId));
  };

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    name: '',
    description: '',
    country: '',
    city: '',
    best_time_to_visit: '',
    timezone: '',
    is_active: true
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Form fields configuration
  const formFields = [
    {
      name: 'name',
      label: 'Destination Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter destination name'
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter country name'
    },
    {
      name: 'city',
      label: 'City',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter city name'
    },
    {
      name: 'best_time_to_visit',
      label: 'Best Time to Visit',
      type: 'text' as const,
      required: false,
      placeholder: 'e.g., October to March'
    },
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., UTC+5:30'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe the destination...',
      rows: 4
    },
    {
      name: 'featured_image',
      label: 'Featured Image',
      type: 'file' as const,
      accept: 'image/*',
      maxSize: 5
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'checkbox' as const
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchTerm);
  };

  const handleCreateFormChange = (field: string, value: any) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract featured_image file from createFormData
    const featuredImageFile = createFormData.featured_image instanceof File ? createFormData.featured_image : undefined;
    
    // Create destination data without the file
    const destinationData = {
      name: createFormData.name,
      description: createFormData.description,
      country: createFormData.country,
      city: createFormData.city,
      best_time_to_visit: createFormData.best_time_to_visit,
      timezone: createFormData.timezone,
      is_active: createFormData.is_active
    };
    
    console.log('Creating destination with data:', destinationData);
    console.log('Featured image file:', featuredImageFile);
    
    const result = await createDestination(destinationData, featuredImageFile);
    if (result) {
      console.log('Destination created successfully:', result);
      setIsCreateDialogOpen(false);
      setCreateFormData({
        name: '',
        description: '',
        country: '',
        city: '',
        best_time_to_visit: '',
        timezone: '',
        is_active: true
      });
    }
  };

  const handleUpdateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDestination) return;
    
    // Extract featured_image file from editFormData
    const featuredImageFile = editFormData.featured_image instanceof File ? editFormData.featured_image : undefined;
    
    // Create update data without the file
    const updateData = {
      name: editFormData.name,
      description: editFormData.description,
      country: editFormData.country,
      city: editFormData.city,
      best_time_to_visit: editFormData.best_time_to_visit,
      timezone: editFormData.timezone,
      is_active: editFormData.is_active
    };
    
    const result = await updateDestination(editingDestination.id, updateData, featuredImageFile);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingDestination(null);
      setEditFormData({});
    }
  };

  const handleToggleDestinationStatus = async (destinationId: string) => {
    setActionLoading(destinationId);
    try {
      // Find the destination and toggle its status
      const destination = destinations.find(d => d.id === destinationId);
      if (destination) {
        await updateDestination(destinationId, { is_active: !destination.is_active });
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDestination = async (destinationId: string, destinationName: string) => {
    if (!confirm(`Are you sure you want to delete destination "${destinationName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(destinationId);
    await deleteDestination(destinationId);
    setActionLoading(null);
  };

  const handleEditDestination = (destination: AdminDestination) => {
    setEditingDestination(destination);
    setEditFormData({
      name: destination.name,
      description: destination.description,
      country: destination.country,
      city: destination.city,
      best_time_to_visit: destination.best_time_to_visit,
      timezone: destination.timezone,
      is_active: destination.is_active
    });
    setIsEditDialogOpen(true);
  };

  const copyDestinationId = async (destinationId: string) => {
    try {
      await navigator.clipboard.writeText(destinationId);
      setCopiedDestinationId(destinationId);
      toast.success('Destination ID copied to clipboard!');
      
      setTimeout(() => {
        setCopiedDestinationId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy destination ID');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && destinations.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading destinations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Destination Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} destinations
        </div>
      </div>

      {/* Search and Create */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search destinations by name, country, or city..."
                  value={searchTerm}
                  onChange={(e) => search(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Destination
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Destination</DialogTitle>
                </DialogHeader>
                <AdminForm
                  title=""
                  fields={formFields}
                  data={createFormData}
                  onChange={handleCreateFormChange}
                  onSubmit={handleCreateDestination}
                  submitText="Create Destination"
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No destinations found matching your search.' : 'No destinations found.'}
            </p>
          </div>
        ) : (
          destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Featured Image */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
                {getImageUrl(destination.featured_image) && !imageErrors.has(destination.id) ? (
                  <Image 
                    src={getImageUrl(destination.featured_image)!}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    onError={() => handleImageError(destination.id)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={destination.is_active ? 'default' : 'secondary'}>
                    {destination.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Copy ID Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyDestinationId(destination.id)}
                    className="h-8 w-8 p-0"
                    title="Copy Destination ID"
                  >
                    {copiedDestinationId === destination.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{destination.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{destination.description}</p>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{destination.city}, {destination.country}</span>
                    </div>
                    {destination.best_time_to_visit && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-2" />
                        <span>Best time: {destination.best_time_to_visit}</span>
                      </div>
                    )}
                  </div>

                  {/* Timezone */}
                  {destination.timezone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Globe className="h-3 w-3 mr-1" />
                      <span>Timezone: {destination.timezone}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(destination.created_at)}
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDestination(destination)}
                    disabled={actionLoading === destination.id}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleDestinationStatus(destination.id)}
                    disabled={actionLoading === destination.id}
                  >
                    {actionLoading === destination.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : destination.is_active ? (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDestination(destination.id, destination.name)}
                    disabled={actionLoading === destination.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === destination.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchDestinations(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchDestinations(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Destination Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>
          {editingDestination && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdateDestination}
              submitText="Update Destination"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
