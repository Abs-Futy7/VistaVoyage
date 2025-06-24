
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import { mockPackages, mockActivities, mockItinerary, mockReviews, mockPackageOffers } from '@/utils/contants';
import { CalendarDays, CheckCircle, Heart, MapPin, Share2, Star, Tag, Users } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { BsArrowRight } from 'react-icons/bs';

function PackageDetailsPage({ params }: { params: { id: string } }) {
  const packageDetails = mockPackages.find(pkg => pkg.id === params.id);

  if (!packageDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md mx-auto text-center p-8 shadow-lg">
          <CardTitle className="text-2xl mb-4 text-red-600">Package Not Found</CardTitle>
          <p className="mb-6 text-muted-foreground">The package you're looking for doesn't exist or has been removed.</p>
          <button className="bg-blue-600 hover:bg-blue-700">
            <a href="/packages">Browse All Packages</a>
          </button>
        </Card>
      </div>
    );
  }

  // Use package data or fall back to defaults
  const itinerary = mockItinerary;
  const activities = mockActivities;
  const offers = mockPackageOffers; // Replace with mockOffers if you have it imported, e.g. const offers = mockOffers;
  const reviews = mockReviews;

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Hero section with parallax effect */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={packageDetails.imageUrl}
            alt={packageDetails.title}
            fill
            className="object-cover scale-110 origin-center"
            priority
            data-ai-hint={packageDetails.imageHint || "travel destination"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Floating category badge */}
        <div className="absolute top-6 right-6">
          <span className="bg-yellow-500 text-black font-medium px-4 py-1.5 rounded-full text-sm shadow-lg">
            {packageDetails.tripType || 'Adventure'}
          </span>
        </div>
        
        {/* Title section at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <div className="flex items-center text-white/80 mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{packageDetails.destination}</span>
            </div>
            <h1 className="font-[Bebas_Neue] text-5xl md:text-7xl font-headline font-bold text-white mb-2 drop-shadow-lg">
              {packageDetails.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white mb-6">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-yellow-400" />
                <span>{packageDetails.duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-yellow-400" />
                <span>{packageDetails.tripType || 'General'}</span>
              </div>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(packageDetails.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2">{packageDetails.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Price & Booking Card */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-10 max-w-screen-lg mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2 p-6 md:p-8 lg:p-10">
              <p className="text-lg leading-relaxed text-gray-600 mb-6">
                {packageDetails.description || "Detailed description not available."}
              </p>
              <div className="flex items-center space-x-4">
                <button className="rounded-full">
                  <Heart className="h-5 w-5 mr-2" /> Save
                </button>
                <button  className="rounded-full">
                  <Share2 className="h-5 w-5 mr-2" /> Share
                </button>
              </div>
            </div>
            <div className="bg-blue-600 text-white p-6 md:p-8 flex flex-col">
              <div className="mb-4">
                <span className="text-3xl font-bold">${packageDetails.price}</span>
                <span className="text-sm opacity-75"> / per person</span>
              </div>
              
              <ul className="my-6 space-y-2 text-sm flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-400 shrink-0" /> 
                  <span>All activities included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-400 shrink-0" /> 
                  <span>Experienced tour guide</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-400 shrink-0" /> 
                  <span>Accommodation included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-400 shrink-0" /> 
                  <span>Free cancellation (48h notice)</span>
                </li>
              </ul>

              <button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full text-lg rounded-2xl py-1 cursor-pointer transition-colors flex items-center justify-center">
                Book Now
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-screen-lg mx-auto">
          <Tabs defaultValue="itinerary" className="w-full ">
            <TabsList className="grid grid-cols-5 mb-8 bg-white rounded-lg p-1  shadow-md">
              <TabsTrigger value="itinerary" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Itinerary</TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Activities</TabsTrigger>
              <TabsTrigger value="stay" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Accommodations</TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Offers</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-headline font-semibold mb-6 text-blue-600 flex items-center">
                <CalendarDays className="mr-2 h-6 w-6" /> Daily Itinerary
              </h3>
              <div className="space-y-8">
                {itinerary.map((item, idx) => (
                  <div key={item.day} className={`relative pl-8 ${idx !== itinerary.length - 1 ? 'pb-8' : ''}`}>
                    {/* Timeline connector */}
                    {idx !== itinerary.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-200"></div>
                    )}
                    {/* Day marker */}
                    <div className="absolute left-0 top-0 bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium">
                      {item.day}
                    </div>
                    <h4 className="font-semibold text-xl text-gray-800 mb-2 ml-2">{item.title}</h4>
                    <p className="text-gray-600 leading-relaxed ml-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-headline font-semibold mb-6 text-blue-600">
                Activities Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start bg-blue-50 p-4 rounded-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 shrink-0 mt-0.5" /> 
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stay" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-headline font-semibold mb-6 text-blue-600">
                Accommodations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(hotel => (
                  <div key={hotel} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={`/images/hotel${hotel}.jpg`}
                        alt={`Hotel example ${hotel}`}
                        fill
                        className="object-cover"
                        data-ai-hint="luxury hotel room"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-1">
                        {hotel === 1 ? 'Luxury Ocean Resort' : 'Downtown Boutique Hotel'}
                      </h4>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">4.8/5</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {hotel === 1 
                          ? 'Beachfront property with stunning ocean views and luxury amenities.' 
                          : 'Located in the heart of the city, walking distance to major attractions.'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{hotel === 1 ? 'Beachfront' : 'City Center'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="offers" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-headline font-semibold mb-6 text-blue-600">
                 Special Offers
              </h3>
              {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 mr-3 text-yellow-600 shrink-0 mt-0.5" /> 
                        <span className="text-gray-800">{offer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No special offers currently available for this package.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-headline font-semibold text-blue-600">
                  Customer Reviews
                </h3>
                <button className="border-blue-600 text-blue-600 cursor-pointer">
                  Write a Review
                </button>
              </div>
              
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-medium mr-3">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{review.userName}</p>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed ml-13">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default PackageDetailsPage;
