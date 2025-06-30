"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Search, 
  Eye, 
  Trash2, 
  Edit,
  Copy,
  Loader2,
  AlertCircle,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Check,
  Users,
  Calendar,
  Percent
} from 'lucide-react';
import { useAdminPromoCodes, useAdminOffers } from '@/hooks/useAdmin';
import AdminForm, { FormField } from '@/components/ui/admin-form';
import { AdminPromoCode } from '@/lib/api/services/admin';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPromoCodesPage() {
  const {
    promoCodes,
    loading,
    error,
    pagination,
    fetchPromoCodes,
    togglePromoCodeStatus,
    deletePromoCode,
    createPromoCode,
    updatePromoCode,
    search,
    searchTerm,
  } = useAdminPromoCodes();

  // Get offers for dropdown
  const { offers, loading: offersLoading } = useAdminOffers();

  console.log('Offers:', offers, 'Loading:', offersLoading);

  // Add debug logging for offers
  if (offers.length === 0 && !offersLoading) {
    console.warn('No offers loaded - this may affect promo code creation');
  }

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<AdminPromoCode | null>(null);
  const [copiedPromoCodeId, setCopiedPromoCodeId] = useState<string | null>(null);

  // Form data state
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_amount: '',
    maximum_discount: '',
    start_date: new Date().toISOString().split('T')[0], // Today's date
    expiry_date: '',
    usage_limit: '',
    is_active: true,
    offer_id: 'none'
  });

  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'code',
      label: 'Promo Code',
      type: 'text',
      required: true,
      placeholder: 'Enter promo code (e.g., SAVE20)'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Brief description of the promo code',
      rows: 3
    },
    {
      name: 'discount_type',
      label: 'Discount Type',
      type: 'select',
      required: true,
      options: [
        { value: 'percentage', label: 'Percentage (%)' },
        { value: 'fixed', label: 'Fixed Amount ($)' }
      ]
    },
    {
      name: 'discount_value',
      label: 'Discount Value',
      type: 'number',
      required: true,
      placeholder: 'Enter discount value (e.g., 20 for 20% or 50 for $50)',
      min: 0,
      step: 0.01
    },
    {
      name: 'minimum_amount',
      label: 'Minimum Order Amount',
      type: 'number',
      required: false,
      placeholder: 'Minimum amount required to use this code',
      min: 0,
      step: 0.01
    },
    {
      name: 'maximum_discount',
      label: 'Maximum Discount Amount',
      type: 'number',
      required: false,
      placeholder: 'Maximum discount amount (for percentage discounts)',
      min: 0,
      step: 0.01
    },
    {
      name: 'start_date',
      label: 'Start Date',
      type: 'date',
      required: true
    },
    {
      name: 'expiry_date',
      label: 'Expiry Date',
      type: 'date',
      required: true
    },
    {
      name: 'usage_limit',
      label: 'Usage Limit',
      type: 'number',
      required: false,
      placeholder: 'Maximum number of uses (leave empty for unlimited)',
      min: 1,
      step: 1
    },
    {
      name: 'offer_id',
      label: 'Linked Offer (Optional)',
      type: 'select',
      required: false,
      placeholder: 'Link to a specific offer (optional)',
      options: [
        { value: 'none', label: 'No linked offer' },
        ...offers.map(offer => ({
          value: offer.id,
          label: offer.title
        }))
      ]
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

  // Helper function to get offer title by ID
  const getOfferTitle = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    return offer ? offer.title : 'Unknown Offer';
  };

  const validateUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createFormData.code?.trim()) {
      toast.error('Promo code is required');
      return;
    }
    
    if (!createFormData.discount_type) {
      toast.error('Discount type is required');
      return;
    }
    
    if (!createFormData.discount_value || parseFloat(createFormData.discount_value) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    
    if (!createFormData.start_date) {
      toast.error('Start date is required');
      return;
    }
    
    if (!createFormData.expiry_date) {
      toast.error('Expiry date is required');
      return;
    }
    
    // Validate date logic
    const startDate = new Date(createFormData.start_date);
    const expiryDate = new Date(createFormData.expiry_date);
    
    if (expiryDate <= startDate) {
      toast.error('Expiry date must be after start date');
      return;
    }
    
    // Validate offer_id if provided
    if (createFormData.offer_id && createFormData.offer_id !== 'none' && !validateUUID(createFormData.offer_id)) {
      toast.error('Invalid offer ID format');
      return;
    }
    
    const promoCodeData = {
      code: createFormData.code.trim().toUpperCase(),
      description: createFormData.description?.trim() || '',
      discount_type: createFormData.discount_type,
      discount_value: parseFloat(createFormData.discount_value),
      minimum_amount: createFormData.minimum_amount ? parseFloat(createFormData.minimum_amount) : null,
      maximum_discount: createFormData.maximum_discount ? parseFloat(createFormData.maximum_discount) : null,
      start_date: createFormData.start_date,
      expiry_date: createFormData.expiry_date,
      usage_limit: createFormData.usage_limit ? parseInt(createFormData.usage_limit) : null,
      is_active: Boolean(createFormData.is_active),
      offer_id: createFormData.offer_id === 'none' ? null : createFormData.offer_id
    };

    console.log('Creating promo code with data:', promoCodeData);

    const result = await createPromoCode(promoCodeData);
    if (result) {
      setIsCreateDialogOpen(false);
      setCreateFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_amount: '',
        maximum_discount: '',
        start_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        usage_limit: '',
        is_active: true,
        offer_id: 'none'
      });
    }
  };

  const handleUpdatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoCode) return;
    
    // Validate dates if both are provided
    if (editFormData.start_date && editFormData.expiry_date) {
      const startDate = new Date(editFormData.start_date);
      const expiryDate = new Date(editFormData.expiry_date);
      
      if (expiryDate <= startDate) {
        toast.error('Expiry date must be after start date');
        return;
      }
    }
    
    // Validate offer_id if it's being updated
    if (editFormData.offer_id && editFormData.offer_id !== 'none' && !validateUUID(editFormData.offer_id)) {
      toast.error('Invalid offer ID format');
      return;
    }
    
    const promoCodeData: any = {};
    
    if (editFormData.code) promoCodeData.code = editFormData.code.trim().toUpperCase();
    if (editFormData.description !== undefined) promoCodeData.description = editFormData.description?.trim() || '';
    if (editFormData.discount_type) promoCodeData.discount_type = editFormData.discount_type;
    if (editFormData.discount_value) promoCodeData.discount_value = parseFloat(editFormData.discount_value);
    if (editFormData.minimum_amount !== undefined) promoCodeData.minimum_amount = editFormData.minimum_amount ? parseFloat(editFormData.minimum_amount) : null;
    if (editFormData.maximum_discount !== undefined) promoCodeData.maximum_discount = editFormData.maximum_discount ? parseFloat(editFormData.maximum_discount) : null;
    if (editFormData.start_date) promoCodeData.start_date = editFormData.start_date;
    if (editFormData.expiry_date) promoCodeData.expiry_date = editFormData.expiry_date;
    if (editFormData.usage_limit !== undefined) promoCodeData.usage_limit = editFormData.usage_limit ? parseInt(editFormData.usage_limit) : null;
    if (editFormData.offer_id !== undefined) promoCodeData.offer_id = editFormData.offer_id === 'none' ? null : editFormData.offer_id;
    if (editFormData.is_active !== undefined) promoCodeData.is_active = Boolean(editFormData.is_active);

    console.log('Updating promo code with data:', promoCodeData);

    const result = await updatePromoCode(editingPromoCode.id, promoCodeData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingPromoCode(null);
      setEditFormData({});
    }
  };

  const handleTogglePromoCodeStatus = async (promoCodeId: string) => {
    setActionLoading(promoCodeId);
    await togglePromoCodeStatus(promoCodeId);
    setActionLoading(null);
  };

  const handleDeletePromoCode = async (promoCodeId: string, promoCodeCode: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${promoCodeCode}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(promoCodeId);
    await deletePromoCode(promoCodeId);
    setActionLoading(null);
  };

  const handleEditPromoCode = (promoCode: AdminPromoCode) => {
    setEditingPromoCode(promoCode);
    setEditFormData({
      code: promoCode.code,
      description: promoCode.description || '',
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value.toString(),
      minimum_amount: promoCode.minimum_amount?.toString() || '',
      maximum_discount: promoCode.maximum_discount?.toString() || '',
      start_date: promoCode.start_date,
      expiry_date: promoCode.expiry_date,
      usage_limit: promoCode.usage_limit?.toString() || '',
      is_active: promoCode.is_active,
      offer_id: promoCode.offer_id || 'none'
    });
    setIsEditDialogOpen(true);
  };

  const copyPromoCodeId = async (promoCodeId: string) => {
    try {
      await navigator.clipboard.writeText(promoCodeId);
      setCopiedPromoCodeId(promoCodeId);
      toast.success('Promo Code ID copied to clipboard!');
      
      setTimeout(() => {
        setCopiedPromoCodeId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy promo code ID');
    }
  };

  const copyPromoCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Promo code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy promo code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && promoCodes.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading promo codes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Promo Code Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} promo codes
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
                  placeholder="Search promo codes by code or offer ID..."
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
                  Create Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Promo Code</DialogTitle>
                </DialogHeader>
                <AdminForm
                  title=""
                  fields={formFields}
                  data={createFormData}
                  onChange={handleCreateFormChange}
                  onSubmit={handleCreatePromoCode}
                  submitText="Create Promo Code"
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

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No promo codes found matching your search.' : 'No promo codes found.'}
            </p>
          </div>
        ) : (
          promoCodes.map((promoCode) => (
            <Card key={promoCode.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="h-24 bg-gradient-to-br from-purple-50 to-pink-50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Ticket className="h-8 w-8 text-white opacity-50" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={promoCode.is_active ? 'default' : 'secondary'}>
                    {promoCode.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Copy ID Button */}
                <div className="absolute top-3 right-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyPromoCodeId(promoCode.id)}
                    className="h-8 w-8 p-0"
                    title="Copy Promo Code ID"
                  >
                    {copiedPromoCodeId === promoCode.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Usage Limit Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="default" className="bg-blue-600">
                    <Users className="h-3 w-3 mr-1" />
                    {promoCode.usage_limit ? `Limit: ${promoCode.usage_limit}` : 'Unlimited'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg font-mono">{promoCode.code}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPromoCode(promoCode.code)}
                        className="h-6 w-6 p-0"
                        title="Copy Promo Code"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Promo Code Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Percent className="h-3 w-3 mr-2" />
                      <span>
                        {promoCode.discount_type === 'percentage' 
                          ? `${promoCode.discount_value}% off` 
                          : `$${promoCode.discount_value} off`
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-3 w-3 mr-2" />
                      <span>Usage: {promoCode.used_count || 0}/{promoCode.usage_limit || 'unlimited'}</span>
                    </div>
                    {promoCode.offer_id && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Linked to: {getOfferTitle(promoCode.offer_id)}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(promoCode.created_at)}
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPromoCode(promoCode)}
                    disabled={actionLoading === promoCode.id}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePromoCodeStatus(promoCode.id)}
                    disabled={actionLoading === promoCode.id}
                  >
                    {actionLoading === promoCode.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : promoCode.is_active ? (
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
                    onClick={() => handleDeletePromoCode(promoCode.id, promoCode.code)}
                    disabled={actionLoading === promoCode.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === promoCode.id ? (
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
                  onClick={() => fetchPromoCodes(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchPromoCodes(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          {editingPromoCode && (
            <AdminForm
              title=""
              fields={formFields}
              data={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdatePromoCode}
              submitText="Update Promo Code"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
