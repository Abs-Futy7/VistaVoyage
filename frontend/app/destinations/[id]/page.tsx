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
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {destination.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About {destination.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                {destination.description || "No description available."}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Right: Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Destination Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>{destination.city ? `${destination.city}, ` : ""}{destination.country}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <span>Best time: {destination.best_time_to_visit || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>Timezone: {destination.timezone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Created: {destination.created_at ? new Date(destination.created_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Updated: {destination.updated_at ? new Date(destination.updated_at).toLocaleDateString() : "N/A"}</span>
              </div>
            </CardContent>
          </Card>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            onClick={() => router.back()}
          >
            Back to Destinations
          </button>
        </div>
      </div>
    </div>
  );
}
