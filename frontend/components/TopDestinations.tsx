"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
interface PublicDestination {
  id: string;
  name: string;
  country: string;
  imageUrl?: string;
  featured_image?: string;
  // ...add other fields as needed
}
import { Button } from "./ui/moving-border";
import Link from "next/link";
import Image from "next/image";
import { BsArrowRight } from "react-icons/bs";

function TopDestinations() {
  const [destinations, setDestinations] = useState<PublicDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<PublicDestination[] | { destinations: PublicDestination[] }>(
          '/api/v1/home/destinations?page=1&limit=4'
        );
        if (Array.isArray(response.data)) {
          setDestinations(response.data);
        } else if (response.data && Array.isArray((response.data as any).destinations)) {
          setDestinations((response.data as { destinations: PublicDestination[] }).destinations);
        } else {
          setDestinations([]);
        }
      } catch (e: any) {
        setError(e.message || 'Error fetching destinations');
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-[#dfe8ff]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-2">
            Top Destinations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore iconic cities and stunning landscapes around the globe.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 sm:px-6 lg:px-8">
            {destinations.map((dest) => {
              const imageUrl = dest.featured_image || dest.imageUrl || "/images/tokyo.webp";
              return (
                <div className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg group border-spacing-1.5 border-1 border-gray-200/20 hover:scale-102" key={dest.id}>
                  <div className="relative h-90 w-full">
                    <Image
                      src={imageUrl}
                      alt={dest.name}
                      fill
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-5xl font-headline font-semibold text-white font-[Bebas_Neue]">
                        {dest.name}
                      </h3>
                      <p className="text-2xl text-white/80 mb-4 font-extralight">
                        {dest.country}
                      </p>
                    </div>
                    {/* Explore button positioned at bottom right */}
                    <div className="absolute bottom-4 right-4">
                      <button className="text-sm text-white bg-yellow-600 px-3 py-2 rounded-2xl hover:bg-yellow-700 transition-colors flex items-center shadow-lg">
                        <Link href={`/destinations/${dest.id}`} className="flex items-center">
                          Explore <BsArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="bg-blue-200/50 text-gray-800 font-[Bebas_Neue] text-xl hover:bg-primary/10"
          >
            <Link href="/destinations">More Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default TopDestinations;
