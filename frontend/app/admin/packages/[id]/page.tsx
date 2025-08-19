"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Calendar,
  Users,
  Star,
  DollarSign,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Tag
} from 'lucide-react';

interface PackageDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function PackageDetailsPage({ params }: PackageDetailsPageProps) {
  const router = useRouter();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchPackageData();
  }, [resolvedParams.id]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPackageById(resolvedParams.id);
      console.log('Package data from backend:', data);
      console.log('Image gallery type:', typeof data.image_gallery, Array.isArray(data.image_gallery) ? 'Is Array' : 'Not Array');
      if (data.image_gallery) {
        console.log('Image gallery content:', data.image_gallery);
      }
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

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      await adminService.togglePackageActiveStatus(resolvedParams.id);
      toast.success(`Package ${packageData.is_active ? 'deactivated' : 'activated'} successfully!`);
      fetchPackageData();
    } catch (error: any) {
      console.error('Failed to toggle package status:', error);
      toast.error('Failed to update package status', {
        description: error.message || 'Please try again'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deletePackage(resolvedParams.id);
      toast.success('Package deleted successfully!');
      router.push('/admin/packages');
    } catch (error: any) {
      console.error('Failed to delete package:', error);
      toast.error('Failed to delete package', {
        description: error.message || 'Please try again'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGalleryImages = (imageGallery?: string[] | null) => {
    // If image_gallery is already an array, use it directly
    if (Array.isArray(imageGallery)) {
      return imageGallery;
    }
    
    // If it's a string (for backward compatibility), try to parse it
    if (typeof imageGallery === 'string') {
      try {
        return JSON.parse(imageGallery);
      } catch {
        return [];
      }
    }
    
    // Default to empty array
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">The package you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/packages')}>
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  const gallery = getGalleryImages(packageData.image_gallery);

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
            <h1 className="text-2xl font-bold">Package Details</h1>
            <Badge variant={packageData.is_active ? 'default' : 'secondary'}>
              {packageData.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {packageData.is_featured && (
              <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/packages/${resolvedParams.id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Live
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/packages/edit/${resolvedParams.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={packageData.is_active ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            disabled={actionLoading}
          >
            {packageData.is_active ? (
              <AlertCircle className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {packageData.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{packageData.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{packageData.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">TK {packageData.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{packageData.duration_days} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{packageData.duration_nights} nights</span>
                </div>
                {packageData.max_group_size && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span>Max {packageData.max_group_size}</span>
                  </div>
                )}
              </div>

              {packageData.difficulty_level && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <Badge variant="outline">
                    {packageData.difficulty_level.charAt(0).toUpperCase() + packageData.difficulty_level.slice(1)}
                  </Badge>
                </div>
              )}

              {(packageData.available_from || packageData.available_until) && (
                <div className="space-y-2">
                  <h4 className="font-medium">Availability</h4>
                  <div className="text-sm text-gray-600">
                    {packageData.available_from && (
                      <p>From: {formatDate(packageData.available_from)}</p>
                    )}
                    {packageData.available_until && (
                      <p>Until: {formatDate(packageData.available_until)}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="highlights" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                  <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                  <TabsTrigger value="terms">Terms</TabsTrigger>
                </TabsList>

                <TabsContent value="highlights" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Package Highlights</h3>
                    <div className="prose max-w-none">
                      {packageData.highlights ? (
                        <div dangerouslySetInnerHTML={{ __html: packageData.highlights.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p className="text-gray-500 italic">No highlights provided</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="itinerary" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Detailed Itinerary</h3>
                    <div className="prose max-w-none">
                      {packageData.itinerary ? (
                        <div>
                          {packageData.itinerary
                            .split(/(?=Day \d+:)/g)
                            .filter(Boolean)
                            .map((day: string, idx: number) => {
                              const [dayTitle, ...descParts] = day.split(':');
                              // Join the rest, trim, and split by newlines, filtering out empty lines
                              const descLines = descParts.join(':').split(/\n+/).map(l => l.trim()).filter(Boolean);
                              return (
                                <div key={idx} className="mb-4 p-3 rounded bg-gray-50 border">
                                  <strong className="block text-blue-700">{dayTitle}:</strong>
                                  <div className="block mt-1 text-gray-700">
                                    {descLines.map((line, i) => (
                                      <div key={i}>{line}</div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No itinerary provided</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="inclusions" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">What's Included</h3>
                    <div className="prose max-w-none">
                      {packageData.inclusions ? (
                        <div dangerouslySetInnerHTML={{ __html: packageData.inclusions.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p className="text-gray-500 italic">No inclusions provided</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="exclusions" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">What's Not Included</h3>
                    <div className="prose max-w-none">
                      {packageData.exclusions ? (
                        <div dangerouslySetInnerHTML={{ __html: packageData.exclusions.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p className="text-gray-500 italic">No exclusions provided</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="terms" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Terms & Conditions</h3>
                    <div className="prose max-w-none">
                      {packageData.terms_conditions ? (
                        <div dangerouslySetInnerHTML={{ __html: packageData.terms_conditions.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p className="text-gray-500 italic">No terms & conditions provided</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packageData.featured_image && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Featured Image</h4>
                  <img
                    src={packageData.featured_image}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {gallery.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Gallery ({gallery.length} images)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {gallery.slice(0, 4).map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Error';
                        }}
                      />
                    ))}
                  </div>
                  {gallery.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{gallery.length - 4} more images
                    </p>
                  )}
                </div>
              )}

              {!packageData.featured_image && gallery.length === 0 && (
                <p className="text-gray-500 text-sm italic">No images uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packageData.min_age && (
                <div>
                  <span className="text-sm text-gray-600">Minimum Age:</span>
                  <p className="font-medium">{packageData.min_age} years</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <p className="font-medium">{formatDate(packageData.created_at)}</p>
              </div>

              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <p className="font-medium">{formatDate(packageData.updated_at)}</p>
              </div>

              {packageData.destination && (
                <div>
                  <span className="text-sm text-gray-600">Destination:</span>
                  <p className="font-medium">{packageData.destination.name}</p>
                </div>
              )}

              {packageData.offer && (
                <div>
                  <span className="text-sm text-gray-600">Offer:</span>
                  <p className="font-medium">{packageData.offer.title}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
