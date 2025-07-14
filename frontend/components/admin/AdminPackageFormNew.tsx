import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus } from 'lucide-react';

interface PackageFormData {
  title: string;
  description: string;
  price: number;
  duration_days: number;
  duration_nights: number;
  destination_id: string;
  is_featured: boolean;
  is_active: boolean;
  
  // Detailed content
  highlights?: string;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  terms_conditions?: string;
  max_group_size?: number;
  min_age?: number;
  available_from?: Date;
  available_until?: Date;
}

interface PackageFormProps {
  initialData?: Partial<PackageFormData>;
  destinations: Array<{ id: string; name: string }>;
  onSubmit: (data: PackageFormData, featuredImage?: File, galleryImages?: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const AdminPackageForm: React.FC<PackageFormProps> = ({
  initialData,
  destinations,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<PackageFormData>({
    title: '',
    description: '',
    price: 0,
    duration_days: 1,
    duration_nights: 0,
    destination_id: '',
    is_featured: false,
    is_active: true,
    ...initialData
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Handle form field changes
  const handleInputChange = (field: keyof PackageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image uploads
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFeaturedImage(file);
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setGalleryPreviews(prev => [...prev, url]);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, featuredImage || undefined, galleryImages);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Package' : 'Create New Package'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Package Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter package title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_days">Duration Days *</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_nights">Duration Nights *</Label>
                  <Input
                    id="duration_nights"
                    type="number"
                    value={formData.duration_nights}
                    onChange={(e) => handleInputChange('duration_nights', parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="destination">Destination *</Label>
                  <Select 
                    value={formData.destination_id} 
                    onValueChange={(value) => handleInputChange('destination_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter package description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked: boolean) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured">Featured Package</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active Package</Label>
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="highlights">Package Highlights</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights || ''}
                  onChange={(e) => handleInputChange('highlights', e.target.value)}
                  placeholder="Enter package highlights (one per line)"
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="itinerary">Detailed Itinerary</Label>
                <Textarea
                  id="itinerary"
                  value={formData.itinerary || ''}
                  onChange={(e) => handleInputChange('itinerary', e.target.value)}
                  placeholder="Enter detailed itinerary"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inclusions">What's Included</Label>
                  <Textarea
                    id="inclusions"
                    value={formData.inclusions || ''}
                    onChange={(e) => handleInputChange('inclusions', e.target.value)}
                    placeholder="List what's included (one per line)"
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="exclusions">What's Not Included</Label>
                  <Textarea
                    id="exclusions"
                    value={formData.exclusions || ''}
                    onChange={(e) => handleInputChange('exclusions', e.target.value)}
                    placeholder="List what's not included (one per line)"
                    rows={5}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions || ''}
                  onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                  placeholder="Enter terms and conditions"
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_group_size">Maximum Group Size</Label>
                  <Input
                    id="max_group_size"
                    type="number"
                    value={formData.max_group_size || ''}
                    onChange={(e) => handleInputChange('max_group_size', parseInt(e.target.value) || undefined)}
                    min="1"
                    placeholder="e.g., 15"
                  />
                </div>

                <div>
                  <Label htmlFor="min_age">Minimum Age</Label>
                  <Input
                    id="min_age"
                    type="number"
                    value={formData.min_age || ''}
                    onChange={(e) => handleInputChange('min_age', parseInt(e.target.value) || undefined)}
                    min="0"
                    placeholder="e.g., 18"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from ? formData.available_from.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('available_from', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="date"
                    value={formData.available_until ? formData.available_until.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('available_until', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <div>
                <Label htmlFor="featured_image">Featured Image</Label>
                <div className="space-y-2">
                  <Input
                    id="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                  />
                  {featuredImage && (
                    <div className="relative w-32 h-24">
                      <img
                        src={URL.createObjectURL(featuredImage)}
                        alt="Featured preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="gallery_images">Image Gallery</Label>
                <div className="space-y-2">
                  <Input
                    id="gallery_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                  />
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded h-20">
                        <button
                          type="button"
                          onClick={() => document.getElementById('gallery_images')?.click()}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Package' : 'Create Package'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
