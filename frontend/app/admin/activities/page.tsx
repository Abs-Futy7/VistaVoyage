"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
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
  Users,
  Zap
} from 'lucide-react';
import { useAdminActivities } from '@/hooks/useAdmin';
import { AdminForm } from '@/components/ui/admin-form';
import { AdminActivity } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function AdminActivitiesPage() {
  const router = useRouter();
  const {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
    deleteActivity,
    createActivity,
    updateActivity,
    search,
    searchTerm,
  } = useAdminActivities();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<AdminActivity | null>(null);
  const [copiedActivityId, setCopiedActivityId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullUrl = `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    console.log('Constructed activity image URL:', fullUrl, 'from path:', imagePath);
    return fullUrl;
  };

  // Handle image load errors
  const handleImageError = (activityId: string) => {
    setImageErrors(prev => new Set(prev).add(activityId));
  };

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    name: '',
    activity_type: 'outdoor',
    description: '',
    duration_hours: '',
    difficulty_level: 'easy',
    age_restriction: '',
    is_active: true
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Form fields configuration
  const formFields = [
    {
      name: 'name',
      label: 'Activity Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter activity name'
    },
    {
      name: 'activity_type',
      label: 'Activity Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'indoor', label: 'Indoor' },
        { value: 'water', label: 'Water Sports' },
        { value: 'adventure', label: 'Adventure' },
        { value: 'cultural', label: 'Cultural' },
        { value: 'nature', label: 'Nature' },
        { value: 'sports', label: 'Sports' },
        { value: 'wellness', label: 'Wellness' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe the activity...',
      rows: 4
    },
    {
      name: 'duration_hours',
      label: 'Duration (Hours)',
      type: 'number' as const,
      required: true,
      placeholder: 'e.g., 2',
      min: 1,
      step: 1
    },
    {
      name: 'difficulty_level',
      label: 'Difficulty Level',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'easy', label: 'Easy' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'challenging', label: 'Challenging' },
        { value: 'extreme', label: 'Extreme' }
      ]
    },
    {
      name: 'age_restriction',
      label: 'Age Restriction',
      type: 'text' as const,
      placeholder: 'e.g., 18+, 12-65, No restriction'
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

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract featured_image file from createFormData
    const featuredImageFile = createFormData.featured_image instanceof File ? createFormData.featured_image : undefined;
    
    // Create activity data without the file
    const activityData = {
      name: createFormData.name,
      activity_type: createFormData.activity_type,
      description: createFormData.description,
      duration_hours: parseInt(createFormData.duration_hours) || 1,
      difficulty_level: createFormData.difficulty_level,
      age_restriction: createFormData.age_restriction,
      is_active: createFormData.is_active
    };

    console.log('Creating activity with data:', activityData);
    console.log('Featured image file:', featuredImageFile);

    const result = await createActivity(activityData, featuredImageFile);
    if (result) {
      console.log('Activity created successfully:', result);
      setIsCreateDialogOpen(false);
      setCreateFormData({
        name: '',
        activity_type: 'outdoor',
        description: '',
        duration_hours: '',
        difficulty_level: 'easy',
        age_restriction: '',
        is_active: true
      });
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    
    // Extract featured_image file from editFormData
    const featuredImageFile = editFormData.featured_image instanceof File ? editFormData.featured_image : undefined;
    
    // Create update data without the file
    const updateData = {
      name: editFormData.name,
      activity_type: editFormData.activity_type,
      description: editFormData.description,
      duration_hours: editFormData.duration_hours ? parseInt(editFormData.duration_hours) : undefined,
      difficulty_level: editFormData.difficulty_level,
      age_restriction: editFormData.age_restriction,
      is_active: editFormData.is_active
    };

    const result = await updateActivity(editingActivity.id, updateData, featuredImageFile);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingActivity(null);
      setEditFormData({});
    }
  };

  const handleDeleteActivity = async (activityId: string, activityName: string) => {
    if (!confirm(`Are you sure you want to delete activity "${activityName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(activityId);
    await deleteActivity(activityId);
    setActionLoading(null);
  };

  const handleEditActivity = (activity: AdminActivity) => {
    setEditingActivity(activity);
    setEditFormData({
      name: activity.name,
      activity_type: activity.activity_type,
      description: activity.description,
      duration_hours: (activity.duration_hours || 1).toString(),
      difficulty_level: activity.difficulty_level,
      age_restriction: activity.age_restriction || '',
      is_active: activity.is_active
    });
    setIsEditDialogOpen(true);
  };

  const copyActivityId = async (activityId: string) => {
    try {
      await navigator.clipboard.writeText(activityId);
      setCopiedActivityId(activityId);
      toast.success('Activity ID copied to clipboard!');
      
      setTimeout(() => {
        setCopiedActivityId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy activity ID');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'challenging': return 'bg-orange-100 text-orange-700';
      case 'extreme': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'outdoor': return 'bg-green-100 text-green-700';
      case 'indoor': return 'bg-blue-100 text-blue-700';
      case 'water': return 'bg-cyan-100 text-cyan-700';
      case 'adventure': return 'bg-red-100 text-red-700';
      case 'cultural': return 'bg-purple-100 text-purple-700';
      case 'nature': return 'bg-emerald-100 text-emerald-700';
      case 'sports': return 'bg-orange-100 text-orange-700';
      case 'wellness': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Activity Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} activities
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
                  placeholder="Search activities by name or type..."
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
                  Create Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Activity</DialogTitle>
                </DialogHeader>
                <AdminForm
                  title=""
                  fields={formFields}
                  data={createFormData}
                  onChange={handleCreateFormChange}
                  onSubmit={handleCreateActivity}
                  submitText="Create Activity"
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

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No activities found matching your search.' : 'No activities found.'}
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Featured Image */}
              <div className="h-48 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
                {getImageUrl(activity.featured_image) && !imageErrors.has(activity.id) ? (
                  <Image 
                    src={getImageUrl(activity.featured_image)!}
                    alt={activity.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                    onError={() => handleImageError(activity.id)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Activity className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={activity.is_active ? 'default' : 'secondary'}>
                    {activity.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Activity Type Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className={getActivityTypeColor(activity.activity_type)}>
                    {activity.activity_type}
                  </Badge>
                </div>

                {/* Copy ID Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyActivityId(activity.id)}
                    className="h-8 w-8 p-0"
                    title="Copy Activity ID"
                  >
                    {copiedActivityId === activity.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="default" className="bg-blue-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.duration_hours}h
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{activity.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{activity.description}</p>
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Zap className="h-3 w-3 mr-2" />
                      <Badge variant="outline" className={getDifficultyColor(activity.difficulty_level || 'easy')}>
                        {activity.difficulty_level || 'easy'}
                      </Badge>
                    </div>
                    {activity.age_restriction && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-3 w-3 mr-2" />
                        <span>Age: {activity.age_restriction}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(activity.created_at)}
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditActivity(activity)}
                    disabled={actionLoading === activity.id}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteActivity(activity.id, activity.name)}
                    disabled={actionLoading === activity.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === activity.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/activities/${activity.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
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
                  onClick={() => fetchActivities(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchActivities(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdateActivity}
              submitText="Update Activity"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
