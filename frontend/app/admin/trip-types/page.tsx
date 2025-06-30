"use client";
import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { useAdminTripTypes } from '@/hooks/useAdmin';
import AdminForm, { FormField } from '@/components/ui/admin-form';
import { AdminTripType } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminTripTypesPage() {
  const {
    tripTypes,
    loading,
    error,
    pagination,
    fetchTripTypes,
    deleteTripType,
    createTripType,
    updateTripType,
    search,
    searchTerm,
    setSearchTerm,
  } = useAdminTripTypes();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTripType, setEditingTripType] = useState<AdminTripType | null>(null);
  const [copiedTripTypeId, setCopiedTripTypeId] = useState<string | null>(null);

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    name: '',
    description: '',
    category: ''
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Fetch data on component mount
  React.useEffect(() => {
    fetchTripTypes();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchTripTypes(page, pagination.limit, searchTerm);
  };

  // Handle copy trip type ID
  const copyTripTypeId = async (tripTypeId: string) => {
    try {
      await navigator.clipboard.writeText(tripTypeId);
      setCopiedTripTypeId(tripTypeId);
      toast.success('Trip Type ID copied to clipboard');
      setTimeout(() => setCopiedTripTypeId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy ID');
    }
  };

  // Handle create trip type
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createFormData.name?.trim()) {
      toast.error('Trip type name is required');
      return;
    }
    
    if (!createFormData.category?.trim()) {
      toast.error('Please select a category');
      return;
    }
    
    const tripTypeData = {
      name: createFormData.name.trim(),
      category: createFormData.category,
      description: createFormData.description?.trim() || ''
    };

    setActionLoading('create');
    try {
      const success = await createTripType(tripTypeData);
      if (success) {
        setIsCreateDialogOpen(false);
        setCreateFormData({
          name: '',
          description: '',
          category: ''
        });
      }
    } catch (error) {
      console.error('Create trip type error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit trip type
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTripType) return;
    
    // Create update data object
    const tripTypeData: any = {};
    
    if (editFormData.name?.trim()) tripTypeData.name = editFormData.name.trim();
    if (editFormData.category?.trim()) tripTypeData.category = editFormData.category;
    if (editFormData.description !== undefined) tripTypeData.description = editFormData.description?.trim() || '';
    
    setActionLoading('edit');
    try {
      const success = await updateTripType(editingTripType.id, tripTypeData);
      if (success) {
        setIsEditDialogOpen(false);
        setEditingTripType(null);
        setEditFormData({});
      }
    } catch (error) {
      console.error('Update trip type error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete trip type
  const handleDelete = async (tripTypeId: string) => {
    if (!confirm('Are you sure you want to delete this trip type?')) return;
    
    setActionLoading(tripTypeId);
    try {
      await deleteTripType(tripTypeId);
    } catch (error) {
      console.error('Delete trip type error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit dialog open
  const openEditDialog = (tripType: AdminTripType) => {
    setEditingTripType(tripType);
    setEditFormData({
      name: tripType.name,
      description: tripType.description || '',
      category: tripType.category
    });
    setIsEditDialogOpen(true);
  };

  // Trip type form fields configuration
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Trip Type Name',
      type: 'text',
      required: true,
      placeholder: 'Enter trip type name...'
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Adventure', label: 'Adventure' },
        { value: 'Cultural', label: 'Cultural' },
        { value: 'Relaxation', label: 'Relaxation' },
        { value: 'Business', label: 'Business' },
        { value: 'Family', label: 'Family' },
        { value: 'Romantic', label: 'Romantic' },
        { value: 'Beach', label: 'Beach' },
        { value: 'Historical', label: 'Historical' },
        { value: 'Nature', label: 'Nature' },
        { value: 'Urban', label: 'Urban' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter trip type description...'
    }
  ];

  if (loading && tripTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading trip types...</span>
        </div>
      </div>
    );
  }

  if (error && tripTypes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trip Types Management</h1>
          <p className="text-gray-600 mt-1">
            Manage travel categories and trip types
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Trip Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Trip Type</DialogTitle>
            </DialogHeader>
            <AdminForm
              title=""
              fields={formFields}
              data={createFormData}
              onChange={(field, value) => setCreateFormData(prev => ({ ...prev, [field]: value }))}
              onSubmit={handleCreate}
              submitText="Create Trip Type"
              loading={actionLoading === 'create'}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search trip types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trip Types List */}
      <div className="grid gap-6">
        {tripTypes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trip types found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first trip type.</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Trip Type
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          tripTypes.map((tripType) => (
            <Card key={tripType.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{tripType.name}</h3>
                      <Badge variant={tripType.is_active ? "default" : "secondary"}>
                        {tripType.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {tripType.category}
                      </Badge>
                    </div>

                    {tripType.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {tripType.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(tripType.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => copyTripTypeId(tripType.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {copiedTripTypeId === tripType.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span className="font-mono">{tripType.id}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tripType)}
                      disabled={actionLoading === tripType.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tripType.id)}
                      disabled={actionLoading === tripType.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {actionLoading === tripType.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trip types
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip Type</DialogTitle>
          </DialogHeader>
          {editingTripType && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={(field, value) => setEditFormData(prev => ({ ...prev, [field]: value }))}
              onSubmit={handleEdit}
              submitText="Update Trip Type"
              loading={actionLoading === 'edit'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
