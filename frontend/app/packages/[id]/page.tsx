"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import { CalendarDays, CheckCircle, Heart, MapPin, Share2, Star, Tag, Users, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { packageService, PublicPackage } from '@/lib/api/services/packages';
// TODO: Update the import path below to the correct location of your destinations service file.
// Example correction if the file is actually named 'destination' (singular):
// import { destinationService, Destination } from '@/lib/api/services/destination';

// If the file does not exist, create 'destination.ts' or 'destinations.ts' in '@/lib/api/services/' with the appropriate exports.
import { destinationService, Destination } from '@/lib/api/services/destinations';
import { toast } from 'sonner';
import { BookingDialog } from '@/components/booking/BookingDialog';

export default function PackageDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [packageDetails, setPackageDetails] = useState<PublicPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [showDestinationDetails, setShowDestinationDetails] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [tripTypeLoading, setTripTypeLoading] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchPackageDetails();
  }, [resolvedParams.id]);

  const fetchDestination = useCallback(async (destinationId: string) => {
    setDestinationLoading(true);
    try {
      const dest = await destinationService.getDestinationById(destinationId);
      setDestination(dest);
    } catch (e) {
      setDestination(null);
    } finally {
      setDestinationLoading(false);
    }
  }, []);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackageById(resolvedParams.id);
      setPackageDetails(data);
      if (data.destination_id) {
        fetchDestination(data.destination_id);
      } else {
        setDestination(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch package details:', error);
      toast.error('Failed to load package details', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const parseGallery = (gallery?: string[] | string) => {
    if (!gallery) return [];
    if (Array.isArray(gallery)) return gallery;
    try {
      return JSON.parse(gallery);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md mx-auto text-center p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Package Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The package you are looking for could not be found.
            </p>
            <a
              href="/packages"
              className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium"
            >
              <BsArrowRight className="w-4 h-4 mr-2" />
              View All Packages
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gallery = parseGallery(packageDetails.image_gallery);
  // Calculate effective price using offer from API

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Hero section with parallax effect */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={packageDetails.featured_image || '/images/default-package.jpg'}
            alt={packageDetails.title}
            fill
            className="object-cover scale-110 origin-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Floating badges */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          {packageDetails.is_featured && (
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </div>
          )}
        </div>
        
        {/* Hero content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-300">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">
                  {destinationLoading ? 'Loading destination...' : (destination ? `${destination.name}, ${destination.country}` : "Unknown")}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {packageDetails.title}
              </h1>
              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>{packageDetails.duration_days} days / {packageDetails.duration_nights} nights</span>
                </div>
                {packageDetails.max_group_size && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Max {packageDetails.max_group_size} people</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Package details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Package</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {packageDetails.description}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Content Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="highlights" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="highlights">Highlights</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="inclusions">Included</TabsTrigger>
                    <TabsTrigger value="exclusions">Excluded</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                  </TabsList>

                  <TabsContent value="highlights" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Package Highlights</h3>
                      {packageDetails.highlights ? (
                        <div className="prose max-w-none">
                          {packageDetails.highlights.split('\n').map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3 mb-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{highlight.trim()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No highlights available</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="itinerary" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Detailed Itinerary</h3>
                      {packageDetails.itinerary ? (
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: packageDetails.itinerary.replace(/\n/g, '<br />') 
                          }} />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Detailed itinerary coming soon</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="inclusions" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">What's Included</h3>
                      {packageDetails.inclusions ? (
                        <div className="prose max-w-none">
                          {packageDetails.inclusions.split('\n').map((inclusion, index) => (
                            <div key={index} className="flex items-start gap-3 mb-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{inclusion.trim()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Inclusions information coming soon</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="exclusions" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">What's Not Included</h3>
                      {packageDetails.exclusions ? (
                        <div className="prose max-w-none">
                          {packageDetails.exclusions.split('\n').map((exclusion, index) => (
                            <div key={index} className="flex items-start gap-3 mb-3">
                              <span className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0">×</span>
                              <span className="text-gray-700">{exclusion.trim()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Exclusions information coming soon</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="terms" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Terms & Conditions</h3>
                      {packageDetails.terms_conditions ? (
                        <div className="prose max-w-none text-sm text-gray-600">
                          <div dangerouslySetInnerHTML={{ 
                            __html: packageDetails.terms_conditions.replace(/\n/g, '<br />') 
                          }} />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Terms & conditions coming soon</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            {gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photo Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Modal for full-size image */}
                  {selectedImage && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                      onClick={() => setSelectedImage(null)}
                    >
                      <div className="relative max-w-3xl w-full">
                        <Image
                          src={selectedImage}
                          alt="Full Size"
                          width={900}
                          height={500}
                          className="rounded-lg object-contain mx-auto"
                        />
                        <button
                          className="absolute top-2 right-2 text-white text-2xl"
                          onClick={e => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Booking sidebar */}
          <div className="space-y-6">
            {/* Price & Booking */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-blue-600">
                        ${packageDetails.price}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">per person</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{packageDetails.duration_days} days</span>
                    </div>
                    {/* {packageDetails.difficulty_level && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Difficulty</span>
                        <span className="font-medium capitalize">{packageDetails.difficulty_level}</span>
                      </div>
                    )} */}
                    {packageDetails.min_age && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Min Age</span>
                        <span className="font-medium">{packageDetails.min_age}+ years</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsBookingDialogOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      Book Now
                      <BsArrowRight className="h-4 w-4" />
                    </button>
                    <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4" />
                      Add to Wishlist
                    </button>
                    {/* Share Package button removed */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Destination</h4>
                  <p className="text-gray-600">
                    {destinationLoading ? 'Loading destination...' : (destination ? `${destination.city}, ${destination.country}` : "Unknown")}
                  </p>
                  {destination && (
                    <div className="mt-2 flex gap-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => setShowDestinationDetails((prev) => !prev)}
                      >
                        {showDestinationDetails ? 'Hide Details' : 'Show Details'}
                      </button>
                      <span className="text-gray-400">|</span>
                      <Link 
                        href={`/destinations/${destination.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Full Destination →
                      </Link>
                    </div>
                  )}
                  {destination && showDestinationDetails && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-gray-700">
                      <div><strong>Name:</strong> {destination.name}</div>
                      <div><strong>City:</strong> {destination.city}</div>
                      <div><strong>Country:</strong> {destination.country}</div>
                      {destination.description && (
                        <div className="mt-2"><strong>Description:</strong> {destination.description}</div>
                      )}
                      {destination.image && (
                        <div className="mt-2">
                          <Image src={destination.image} alt={destination.name} width={320} height={180} className="rounded-md object-cover" />
                        </div>
                      )}
                      <div className="mt-3 pt-2 border-t border-blue-200">
                        <Link 
                          href={`/destinations/${destination.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Complete Destination Details →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {packageDetails.available_from && (
                  <div>
                    <h4 className="font-medium mb-2">Available From</h4>
                    <p className="text-gray-600">{formatDate(packageDetails.available_from)}</p>
                  </div>
                )}
                
                {packageDetails.available_until && (
                  <div>
                    <h4 className="font-medium mb-2">Available Until</h4>
                    <p className="text-gray-600">{formatDate(packageDetails.available_until)}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-gray-600">{formatDate(packageDetails.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        packageId={resolvedParams.id}
        packageTitle={packageDetails.title}
        packagePrice={packageDetails.price}
        onBookingSuccess={(bookingId) => {
          toast.success('Booking created successfully!');
          setIsBookingDialogOpen(false);
          // Optionally redirect to booking confirmation page
          // window.location.href = `/bookings/${bookingId}`;
        }}
      />
    </div>
  );
}
