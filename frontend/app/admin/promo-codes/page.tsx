"use client";
import React, { useState, useEffect } from 'react';
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
import { AdminPromoCode } from '@/lib/api/services/admin';
import { promoCodeService } from '@/lib/api/services/promocode';
import AdminForm, { FormField } from '@/components/ui/admin-form';
import { Card } from '@/components/ui/card';

import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_access_token');
    if (!adminToken) {
      toast.error('Please login as admin to access this page');
      window.location.href = '/admin/login';
      return;
    }
  }, []);

  // Fetch promo codes (list)
  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      
      // Debug authentication status
      const adminToken = localStorage.getItem('admin_access_token');
      console.log('Admin token available:', !!adminToken);
      if (adminToken) {
        console.log('Admin token preview:', adminToken.substring(0, 20) + '...');
      }
      
      const response = await promoCodeService.getAdminPromoCodes();
      setPromoCodes(
        (response.promo_codes || []).map((promo: any) => ({
          ...promo,
          description: promo.description ?? '',
          minimum_amount: promo.minimum_amount ?? undefined,
          maximum_discount: promo.maximum_discount ?? undefined,
          usage_limit: promo.usage_limit ?? undefined,
          start_date: promo.start_date ?? '',
          used_count: promo.used_count ?? 0,
          created_at: promo.created_at ?? '',
          updated_at: promo.updated_at ?? '',
          is_active: promo.is_active ?? true,
        }))
      );
      setPagination((prev) => ({
        ...prev,
        total: response.total_count || (response.promo_codes ? response.promo_codes.length : 0),
        totalPages: 1 // No pagination support in promoCodeService
      }));
      setError(null);
    } catch (err: any) {
      console.error('Fetch promo codes error:', err);
      
      // Handle authentication errors specifically
      if (err.status === 403 || err.message?.includes('Not authenticated')) {
        setError('Authentication failed. Please login as admin.');
        toast.error('Please login as admin to access promo codes');
        // Redirect to admin login if not authenticated
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        setError(err.message || 'Failed to fetch promo codes');
        toast.error('Failed to load promo codes');
      }
    } finally {
      setLoading(false);
    }
  };

  // CRUD functions (single set, using promoCodeService only)
  const createPromoCode = async (promoCodeData: any) => {
    try {
      setLoading(true);
      await promoCodeService.createPromoCode(promoCodeData);
      toast.success('Promo code created successfully');
      await fetchPromoCodes();
      return true;
    } catch (err: any) {
      toast.error('Failed to create promo code');
    }
  };

  // updatePromoCode should be a top-level function, not nested
  const updatePromoCode = async (id: string, promoCodeData: any) => {
    try {
      setLoading(true);
      await promoCodeService.updatePromoCode(id, promoCodeData);
      toast.success('Promo code updated successfully');
      await fetchPromoCodes();
      return true;
    } catch (err: any) {
      toast.error('Failed to update promo code');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const togglePromoCodeStatus = async (id: string) => {
    try {
      setLoading(true);
      await promoCodeService.togglePromoCodeStatus(id);
      toast.success('Promo code status updated');
      await fetchPromoCodes();
    } catch (err: any) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      setLoading(true);
      await promoCodeService.deletePromoCode(id);
      toast.success('Promo code deleted');
      await fetchPromoCodes();
    } catch (err: any) {
      toast.error('Failed to delete promo code');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchPromoCodes();
    // eslint-disable-next-line
  }, []);

  const search = (term: string) => {
    setSearchTerm(term);
    fetchPromoCodes();
  };



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
    is_active: true
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
        { value: 'fixed', label: 'Fixed Amount (TK)' }
      ]
    },
    {
      name: 'discount_value',
      label: 'Discount Value',
      type: 'number',
      required: true,
      placeholder: 'Enter discount value (e.g., 20 for 20% or 50 for TK 50)',
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
    // Removed Linked Offer and unsupported fields
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

  // Removed getOfferTitle helper

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
    
    // Removed offer_id validation
    
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
      // offer_id removed
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
        // offer_id removed
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
    
    // Removed offer_id validation
    
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
    // offer_id removed
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
      is_active: promoCode.is_active
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
      <div className="bg-white rounded-lg shadow-sm p-6">
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No promo codes found matching your search.' : 'No promo codes found.'}
            </p>
          </div>
        ) : (
          promoCodes.map((promoCode: AdminPromoCode) => (
            <div
              key={promoCode.id}
              className="bg-white rounded-lg border border-yellow-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Header */}
              <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xl text-yellow-800">
                    {promoCode.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyPromoCode(promoCode.code)}
                    className="h-7 w-7 p-0 hover:bg-yellow-100 rounded-full transition-all duration-200"
                    title="Copy Promo Code"
                  >
                    <Copy className="h-3.5 w-3.5 text-yellow-700" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={promoCode.is_active ? 'default' : 'secondary'}
                    className={`${promoCode.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} font-medium`}
                  >
                    {promoCode.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Discount Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {promoCode.discount_type === 'percentage' 
                          ? `${promoCode.discount_value}% off` 
                          : `TK ${promoCode.discount_value} off`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-gray-600">
                        Used: {promoCode.used_count || 0}/{promoCode.usage_limit || '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {promoCode.description && (
                    <p className="text-xs text-gray-500 mt-2">{promoCode.description}</p>
                  )}

                  {/* Date Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-gray-500">
                        <span className="font-medium">Created:</span> {formatDate(promoCode.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-gray-500">
                        <span className="font-medium">Expires:</span> {formatDate(promoCode.expiry_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPromoCode(promoCode)}
                    disabled={actionLoading === promoCode.id}
                    className="flex-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPromoCodeId(promoCode.id)}
                    disabled={actionLoading === promoCode.id}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    title="Copy ID"
                  >
                    {copiedPromoCodeId === promoCode.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePromoCodeStatus(promoCode.id)}
                    disabled={actionLoading === promoCode.id}
                    className={`
                      ${promoCode.is_active 
                        ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 hover:border-amber-300' 
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300'
                      }
                      transition-all duration-200 h-8 w-8 p-0
                    `}
                    title={promoCode.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {actionLoading === promoCode.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : promoCode.is_active ? (
                      <ToggleRight className="h-3 w-3" />
                    ) : (
                      <ToggleLeft className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePromoCode(promoCode.id, promoCode.code)}
                    disabled={actionLoading === promoCode.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 h-8 w-8 p-0"
                    title="Delete"
                  >
                    {actionLoading === promoCode.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              {/* Pagination is not supported, so just show disabled buttons */}
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" disabled>Next</Button>
            </div>
          </div>
        </div>
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
