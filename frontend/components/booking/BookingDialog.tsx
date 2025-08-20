"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, Tag, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { bookingService, CreateBookingRequest, PromoValidationResponse } from '@/lib/api/services/bookings';
import { useAuth } from '@/hooks/useAuth';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageTitle: string;
  packagePrice: number;
  onBookingSuccess?: (bookingId: string) => void;
}

export function BookingDialog({ 
  isOpen, 
  onClose, 
  packageId, 
  packageTitle, 
  packagePrice,
  onBookingSuccess 
}: BookingDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoValidating, setPromoValidating] = useState(false);
  
  // Booking form data
  const [formData, setFormData] = useState({
    numberOfPeople: 1,
    promoCode: '',
    hasPromoCode: false
  });

  // Promo validation state
  const [promoValidation, setPromoValidation] = useState<PromoValidationResponse | null>(null);
  
  // Calculate base total
  const baseTotal = packagePrice * formData.numberOfPeople;
  const finalAmount = promoValidation?.final_amount || baseTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBooking();
  };

  const validatePromoCode = async () => {
    if (!formData.promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoValidating(true);
    try {
      const response = await bookingService.validatePromoCode({
        code: formData.promoCode,
        booking_amount: baseTotal,
        package_id: packageId
      });

      if (response.success && response.data) {
        setPromoValidation(response.data);
        if (response.data.is_valid) {
          toast.success(`Promo code applied! You save TK ${response.data.discount_amount}`);
        } else {
          toast.error(response.data.message || 'Invalid promo code');
        }
      } else {
        toast.error(response.message || 'Failed to validate promo code');
      }
    } catch (error: any) {
      console.error('Promo validation error:', error);
      toast.error('Failed to validate promo code');
    } finally {
      setPromoValidating(false);
    }
  };

  const createBooking = async () => {
    if (!user) {
      toast.error('Please log in to create a booking');
      return;
    }

    setLoading(true);
    try {
      const bookingData: CreateBookingRequest = {
        package_id: packageId,
        total_amount: finalAmount,
        promo_code: formData.hasPromoCode && promoValidation?.is_valid ? formData.promoCode : undefined
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success && response.data) {
        toast.success('Booking created successfully!');
        onBookingSuccess?.(response.data.id);
        onClose();
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numberOfPeople: 1,
      promoCode: '',
      hasPromoCode: false
    });
    setPromoValidation(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Package</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">{packageTitle}</h3>
            <p className="text-blue-700">TK {packagePrice} per person</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="numberOfPeople">Number of People</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="numberOfPeople"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfPeople}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    numberOfPeople: parseInt(e.target.value) || 1 
                  }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasPromoCode"
                checked={formData.hasPromoCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hasPromoCode: e.target.checked,
                  promoCode: e.target.checked ? prev.promoCode : ''
                }))}
                className="rounded"
              />
              <Label htmlFor="hasPromoCode">I have a promo code</Label>
              {promoValidation?.is_valid && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Applied</span>
                </div>
              )}
            </div>

            {formData.hasPromoCode && (
              <div className="space-y-3">
                <Label htmlFor="promoCodeInput">Promo Code</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="promoCodeInput"
                      value={formData.promoCode}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }));
                        setPromoValidation(null); // Reset validation when code changes
                      }}
                      placeholder="Enter promo code"
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validatePromoCode}
                    disabled={promoValidating || !formData.promoCode.trim()}
                    className="px-4"
                  >
                    {promoValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Validate'
                    )}
                  </Button>
                </div>
                
                {/* Validation Status */}
                {promoValidation && promoValidation.is_valid && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span>{promoValidation.message || 'Promo code applied!'} You save TK {promoValidation.discount_amount}</span>
                  </div>
                )}
                
                {promoValidation && !promoValidation.is_valid && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span>{promoValidation.message || 'Invalid promo code'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Base Price ({formData.numberOfPeople} × TK {packagePrice})</span>
                <span>${baseTotal}</span>
              </div>
              {promoValidation?.is_valid && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-TK {promoValidation.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>TK {finalAmount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Book Now'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
