"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Search, 
  Trash2, 
  Edit,
  Percent,
  Loader2,
  AlertCircle,
  PlusCircle,
  Copy,
  Check
} from 'lucide-react';
import { useAdminOffers } from '@/hooks/useAdmin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminForm, { FormField } from '@/components/ui/admin-form';
import { AdminOffer } from '@/lib/api/services/admin';
import { toast } from 'sonner';

export default function AdminOffersPage() {
  const {
    offers,
    loading,
    error,
    pagination,
    fetchOffers,
    toggleOfferStatus,
    deleteOffer,
    createOffer,
    updateOffer,
    search,
    searchTerm,
  } = useAdminOffers();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    title: '',
    description: '',
    discount_percentage: '',
    discount_amount: '',
    max_usage_per_user: '',
    total_usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'title',
      label: 'Offer Title',
      type: 'text',
      required: true,
      placeholder: 'Enter offer title'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter offer description',
      rows: 4
    },
    {
      name: 'discount_percentage',
      label: 'Discount Percentage',
      type: 'number',
      placeholder: 'e.g., 20 (for 20%)',
      min: 0,
      max: 100,
      step: 0.01
    },
    {
      name: 'discount_amount',
      label: 'Discount Amount',
      type: 'number',
      placeholder: 'e.g., 100.00',
      min: 0,
      step: 0.01
    },
    {
      name: 'max_usage_per_user',
      label: 'Max Usage Per User',
      type: 'number',
      placeholder: 'Leave empty for unlimited',
      min: 0,
      step: 1
    },
    {
      name: 'total_usage_limit',
      label: 'Total Usage Limit',
      type: 'number',
      placeholder: 'Leave empty for unlimited',
      min: 0,
      step: 1
    },
    {
      name: 'valid_from',
      label: 'Valid From',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'valid_until',
      label: 'Valid Until',
      type: 'datetime-local',
      required: true
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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const offerData = {
      ...createFormData,
      discount_percentage: createFormData.discount_percentage ? parseFloat(createFormData.discount_percentage) : undefined,
      discount_amount: createFormData.discount_amount ? parseFloat(createFormData.discount_amount) : undefined,
      max_usage_per_user: createFormData.max_usage_per_user ? parseInt(createFormData.max_usage_per_user) : undefined,
      total_usage_limit: createFormData.total_usage_limit ? parseInt(createFormData.total_usage_limit) : undefined,
    };

    const result = await createOffer(offerData);
    if (result) {
      setIsCreateDialogOpen(false);
      setCreateFormData({
        title: '',
        description: '',
        discount_percentage: '',
        discount_amount: '',
        max_usage_per_user: '',
        total_usage_limit: '',
        valid_from: '',
        valid_until: '',
        is_active: true
      });
    }
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    
    const offerData = {
      ...editFormData,
      discount_percentage: editFormData.discount_percentage ? parseFloat(editFormData.discount_percentage) : undefined,
      discount_amount: editFormData.discount_amount ? parseFloat(editFormData.discount_amount) : undefined,
      max_usage_per_user: editFormData.max_usage_per_user ? parseInt(editFormData.max_usage_per_user) : undefined,
      total_usage_limit: editFormData.total_usage_limit ? parseInt(editFormData.total_usage_limit) : undefined,
    };

    const result = await updateOffer(editingOffer.id, offerData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingOffer(null);
      setEditFormData({});
    }
  };

  const handleToggleActiveStatus = async (offerId: string, currentStatus: boolean) => {
    setActionLoading(offerId);
    await toggleOfferStatus(offerId);
    setActionLoading(null);
  };

  const handleDeleteOffer = async (offerId: string, offerTitle: string) => {
    if (!confirm(`Are you sure you want to delete offer "${offerTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(offerId);
    await deleteOffer(offerId);
    setActionLoading(null);
  };

  const handleEditOffer = (offer: AdminOffer) => {
    setEditingOffer(offer);
    setEditFormData({
      title: offer.title,
      description: offer.description,
      discount_percentage: offer.discount_percentage?.toString() || '',
      discount_amount: offer.discount_amount?.toString() || '',
      max_usage_per_user: offer.max_usage_per_user?.toString() || '',
      total_usage_limit: offer.total_usage_limit?.toString() || '',
      valid_from: offer.valid_from ? new Date(offer.valid_from).toISOString().slice(0, 16) : '',
      valid_until: offer.valid_until ? new Date(offer.valid_until).toISOString().slice(0, 16) : '',
      is_active: offer.is_active
    });
    setIsEditDialogOpen(true);
  };

  const copyOfferId = async (offerId: string) => {
    try {
      await navigator.clipboard.writeText(offerId);
      setCopiedOfferId(offerId);
      toast.success('Offer ID copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedOfferId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy offer ID');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isOfferExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getOfferStatus = (offer: AdminOffer) => {
    if (!offer.is_active) return { label: 'Inactive', variant: 'destructive' as const };
    if (isOfferExpired(offer.valid_until)) return { label: 'Expired', variant: 'secondary' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  if (loading && offers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Offers Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} offers
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
                  placeholder="Search offers by title..."
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
                  Create Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                </DialogHeader>
                <AdminForm
                  title=""
                  fields={formFields}
                  data={createFormData}
                  onChange={handleCreateFormChange}
                  onSubmit={handleCreateOffer}
                  submitText="Create Offer"
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

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offers ({offers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No offers found matching your search.' : 'No offers found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Offer</th>
                    <th className="text-left py-3 px-4 font-medium">Offer ID</th>
                    <th className="text-left py-3 px-4 font-medium">Discount</th>
                    <th className="text-left py-3 px-4 font-medium">Valid Period</th>
                    <th className="text-left py-3 px-4 font-medium">Usage Limits</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const offerId = offer.id;
                    const status = getOfferStatus(offer);
                    
                    return (
                      <tr key={offerId} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{offer.title}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {offer.description}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {offerId.slice(0, 8)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyOfferId(offerId)}
                              className="h-6 w-6 p-0"
                              title="Copy Offer ID"
                            >
                              {copiedOfferId === offerId ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            {offer.discount_percentage && (
                              <div className="flex items-center gap-1">
                                <Percent className="w-3 h-3 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">
                                  {offer.discount_percentage}%
                                </span>
                              </div>
                            )}
                            {offer.discount_amount && (
                              <div className="text-sm font-semibold text-blue-600">
                                {formatCurrency(offer.discount_amount)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div>From: {formatDate(offer.valid_from)}</div>
                            <div>Until: {formatDate(offer.valid_until)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div>Per User: {offer.max_usage_per_user || 'Unlimited'}</div>
                            <div className="text-gray-600">
                              Total: {offer.total_usage_limit || 'Unlimited'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOffer(offer)}
                              disabled={actionLoading === offerId}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActiveStatus(offerId, offer.is_active)}
                              disabled={actionLoading === offerId}
                            >
                              {actionLoading === offerId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : offer.is_active ? (
                                'Deactivate'
                              ) : (
                                'Activate'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOffer(offerId, offer.title)}
                              disabled={actionLoading === offerId}
                              className="text-red-600 hover:text-red-700"
                            >
                              {actionLoading === offerId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <><Trash2 className="h-4 w-4 mr-1" /> Delete</>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
                  onClick={() => fetchOffers(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchOffers(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
          </DialogHeader>
          {editingOffer && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdateOffer}
              submitText="Update Offer"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
