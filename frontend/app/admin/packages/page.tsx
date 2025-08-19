"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Search, 
  Edit,
  Trash2, 
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Loader2,
  AlertCircle,
  PlusCircle,
  Copy,
  Check
} from 'lucide-react';
import { useAdminPackages, useAdminDestinations } from '@/hooks/useAdmin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminForm, { FormField } from '@/components/ui/admin-form';
import { AdminPackage } from '@/lib/api/services/admin';
import { toast } from 'sonner';

// Helper function to validate UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default function AdminPackagesPage() {
  const router = useRouter();
  const {
    packages,
    loading,
    error,
    pagination,
    fetchPackages,
    togglePackageStatus,
    deletePackage,
    createPackage,
    updatePackage,
    search,
    searchTerm,
  } = useAdminPackages();

  // Get destinations for dropdowns
  const { destinations, loading: destinationsLoading } = useAdminDestinations();

  console.log('Destinations:', destinations, 'Loading:', destinationsLoading);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null);
  const [copiedPackageId, setCopiedPackageId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Helper functions to get related data names
  const getDestinationName = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? `${destination.name}, ${destination.country}` : destinationId.substring(0, 8) + '...';
  };

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullUrl = `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    console.log('Constructed package image URL:', fullUrl, 'from path:', imagePath);
    return fullUrl;
  };

  // Handle image load errors
  const handleImageError = (packageId: string) => {
    setImageErrors(prev => new Set(prev).add(packageId));
  };

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    title: '',
    description: '',
    price: '',
    duration_days: '1',
    duration_nights: '0',
    destination_id: '',
    is_featured: false,
    is_active: true
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'title',
      label: 'Package Title',
      type: 'text',
      required: true,
      placeholder: 'Enter package title'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the package details...',
      rows: 4
    },
    {
      name: 'price',
      label: 'Price (TK)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 1299',
      min: 0,
      step: 0.01
    },
    {
      name: 'duration_days',
      label: 'Duration (Days)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 7',
      min: 1,
      step: 1
    },
    {
      name: 'duration_nights',
      label: 'Duration (Nights)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 6',
      min: 0,
      step: 1
    },
    {
      name: 'destination_id',
      label: 'Destination',
      type: 'select',
      required: true,
      placeholder: 'Select a destination',
      options: destinations.map(dest => ({
        value: dest.id,
        label: `${dest.name} (${dest.city}, ${dest.country})`
      }))
    },
     
    {
      name: 'featured_image',
      label: 'Featured Image',
      type: 'file',
      accept: 'image/*',
      maxSize: 5
    },
    {
      name: 'is_featured',
      label: 'Featured Package',
      type: 'checkbox'
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'checkbox'
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

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if reference data is loaded
    
    
    // Validate required fields
    if (!createFormData.title?.trim()) {
      toast.error('Package title is required');
      return;
    }
    
    if (!createFormData.description?.trim()) {
      toast.error('Package description is required');
      return;
    }
    
    if (!createFormData.price || parseFloat(createFormData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (!createFormData.duration_days || parseInt(createFormData.duration_days) <= 0) {
      toast.error('Please enter valid duration days');
      return;
    }
    
    if (createFormData.duration_nights === '' || parseInt(createFormData.duration_nights) < 0) {
      toast.error('Please enter valid duration nights');
      return;
    }
    
    if (!createFormData.destination_id) {
      toast.error('Please select a destination');
      return;
    }

    // Validate that selected IDs exist in the loaded data
    const selectedDestination = destinations.find(d => d.id === createFormData.destination_id);
   
    
    if (!selectedDestination) {
      toast.error('Selected destination is invalid');
      return;
    }
    
    // Validate UUID format
    if (!isValidUUID(createFormData.destination_id)) {
      toast.error('Invalid destination ID format');
      return;
    }
    
    // Extract featured_image file from createFormData
    const featuredImageFile = createFormData.featured_image instanceof File ? createFormData.featured_image : undefined;

    // Ensure duration values are properly converted to integers
    const durationDays = parseInt(createFormData.duration_days);
    const durationNights = parseInt(createFormData.duration_nights);
    
    if (isNaN(durationDays) || durationDays <= 0) {
      toast.error('Duration days must be a positive number');
      return;
    }
    
    if (isNaN(durationNights) || durationNights < 0) {
      toast.error('Duration nights must be a non-negative number');
      return;
    }

    const packageData = {
      title: createFormData.title.trim(),
      description: createFormData.description.trim(),
      price: parseFloat(createFormData.price),
      duration_days: durationDays,
      duration_nights: durationNights,
      destination_id: createFormData.destination_id,
      is_featured: Boolean(createFormData.is_featured),
      is_active: Boolean(createFormData.is_active)
    };

    console.log('Creating package with data:', packageData);
    console.log('Featured image file:', featuredImageFile);
    console.log('Destination exists:', selectedDestination);

    const result = await createPackage(packageData, featuredImageFile);
    if (result) {
      console.log('Package created successfully:', result);
      setIsCreateDialogOpen(false);
      setCreateFormData({
        title: '',
        description: '',
        price: '',
        duration_days: '1',
        duration_nights: '0',
        destination_id: '',
        is_featured: false,
        is_active: true
      });
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    // Extract featured_image file from editFormData
    const featuredImageFile = editFormData.featured_image instanceof File ? editFormData.featured_image : undefined;
    
    const packageData = {
      ...(editFormData.title && { title: editFormData.title.trim() }),
      ...(editFormData.description && { description: editFormData.description.trim() }),
      ...(editFormData.price && { price: parseFloat(editFormData.price) }),
      ...(editFormData.duration_days && { duration_days: parseInt(editFormData.duration_days) }),
      ...(editFormData.duration_nights && { duration_nights: parseInt(editFormData.duration_nights) }),
      ...(editFormData.destination_id && { destination_id: editFormData.destination_id }),
      ...(editFormData.is_featured !== undefined && { is_featured: Boolean(editFormData.is_featured) }),
      ...(editFormData.is_active !== undefined && { is_active: Boolean(editFormData.is_active) })
    };

    console.log('Updating package with data:', packageData);
    console.log('Featured image file:', featuredImageFile);

    const result = await updatePackage(editingPackage.id, packageData, featuredImageFile);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      setEditFormData({});
    }
  };

  const handleTogglePackageStatus = async (packageId: string) => {
    setActionLoading(packageId);
    await togglePackageStatus(packageId);
    setActionLoading(null);
  };

  const handleDeletePackage = async (packageId: string, packageTitle: string) => {
    if (!confirm(
      `Are you sure you want to delete package "${packageTitle}"?\n\n` +
      `⚠️ This action cannot be undone.\n\n` +
      `Note: If there are active bookings for this package, you'll need to cancel or complete them first.`
    )) {
      return;
    }

    setActionLoading(packageId);
    await deletePackage(packageId);
    setActionLoading(null);
  };

  const handleEditPackage = (pkg: AdminPackage) => {
    console.log('Editing package keys:', Object.keys(pkg));
    setEditingPackage(pkg);
    setEditFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price.toString(),
      duration_days: pkg.duration_days.toString(),
      duration_nights: pkg.duration_nights.toString(),
      destination_id: pkg.destination_id,
      is_featured: pkg.is_featured,
      is_active: pkg.is_active
    });
    setIsEditDialogOpen(true);
  };

  const copyPackageId = async (packageId: string) => {
    try {
      await navigator.clipboard.writeText(packageId);
      setCopiedPackageId(packageId);
      toast.success('Package ID copied to clipboard!');
      
      setTimeout(() => {
        setCopiedPackageId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy package ID');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && packages.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Package Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: {pagination.total} packages
          </div>
          <Button
            onClick={() => router.push('/admin/packages/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Package
          </Button>
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
                  placeholder="Search packages by title..."
                  value={searchTerm}
                  onChange={(e) => search(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            
            
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

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              </div>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No packages found matching your search.' : 'No packages found.'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first package to get started!
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Featured Image */}
              <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
                {getImageUrl(pkg.featured_image) && !imageErrors.has(pkg.id) ? (
                  <Image 
                    src={getImageUrl(pkg.featured_image)!}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    onError={() => handleImageError(pkg.id)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <Package className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Featured Badge */}
                {pkg.is_featured && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Copy ID Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyPackageId(pkg.id)}
                    className="h-8 w-8 p-0"
                    title="Copy Package ID"
                  >
                    {copiedPackageId === pkg.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="default" className="bg-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatPrice(pkg.price)}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{pkg.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-1">{pkg.description}</p>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {typeof pkg.duration_days === 'number' && typeof pkg.duration_nights === 'number'
                          ? `${pkg.duration_days}D/${pkg.duration_nights}N`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">
                        {getDestinationName(pkg.destination_id)}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(pkg.created_at)}
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/packages/${pkg.id}`)}
                    disabled={actionLoading === pkg.id}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/packages/edit/${pkg.id}`)}
                    disabled={actionLoading === pkg.id}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePackageStatus(pkg.id)}
                    disabled={actionLoading === pkg.id}
                  >
                    {actionLoading === pkg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : pkg.is_active ? (
                      'Deactivate'
                    ) : (
                      'Activate'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                    disabled={actionLoading === pkg.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === pkg.id ? (
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
                  onClick={() => fetchPackages(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchPackages(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdatePackage}
              submitText="Update Package"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
