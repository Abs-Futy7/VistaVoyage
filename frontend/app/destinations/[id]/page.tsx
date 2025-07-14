"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Loader2, MapPin, CalendarDays, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { destinationService, Destination } from "@/lib/api/services/destinations";

export default function DestinationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDestination = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await destinationService.getDestinationById(id as string);
        setDestination(data);
      } catch (err: any) {
        setError("Failed to load destination details");
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md mx-auto text-center p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Destination Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || "The destination you are looking for could not be found."}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              onClick={() => router.back()}
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Hero section */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={destination.featured_image || "/placeholder.png"}
            alt={destination.name}
            fill
            className="object-cover scale-110 origin-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-4xl mx-auto px-4 pb-12 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-200">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{destination.country}{destination.city ? `, ${destination.city}` : ""}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-[Bebas_Neue] leading-tight">
                {destination.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="rounded-xl bg-gradient-to-t from-white to-blue-50/30 border-1 border-blue-600/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center text-primary">
                <Globe className="h-6 w-6 mr-3 text-blue-600" />
                About {destination.name}
                
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {destination.description || "This destination offers unique experiences and breathtaking views that will create lasting memories. From its rich cultural heritage to stunning natural landscapes, every moment here is an adventure waiting to be discovered."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Travel Highlights */}
          <Card className="rounded-xl bg-gradient-to-t from-white to-green-50/30 border-1 border-blue-600/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Travel Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{destination.city ? `${destination.city}, ` : ""}{destination.country}</p>
                  </div>
                </div>
                
                {destination.best_time_to_visit && (
                  <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <CalendarDays className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Best Time to Visit</p>
                      <p className="text-sm text-gray-600">{destination.best_time_to_visit}</p>
                    </div>
                  </div>
                )}
                
                {destination.timezone && (
                  <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Clock className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Timezone</p>
                      <p className="text-sm text-gray-600">{destination.timezone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <Globe className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Country</p>
                    <p className="text-sm text-gray-600">{destination.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Info Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
          

          <Card className="rounded-xl bg-gradient-to-t from-white to-gray-100/50 border-1 border-blue-600/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center text-primary">
                <Clock className="h-5 w-5 mr-2" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              {destination.created_at && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Added</span>
                  <span className="text-gray-700">{new Date(destination.created_at).toLocaleDateString()}</span>
                </div>
              )}
              {destination.updated_at && (
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Updated</span>
                  <span className="text-gray-700">{new Date(destination.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
            onClick={() => router.back()}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Destinations
          </button>
        </div>
      </div>
    </div>
  );
}
