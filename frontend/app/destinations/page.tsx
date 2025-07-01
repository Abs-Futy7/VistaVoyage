"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import DestinationCard from "@/components/ui/DestinationCard";
import { destinationService, Destination, DestinationSearchFilters } from "@/lib/api/services/destinations";
import { toast } from "sonner";

// Define a type for destinations that have guaranteed imageUrl
type DestinationWithImageUrl = Omit<Destination, 'imageUrl'> & { imageUrl: string };

function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");
  const [destinations, setDestinations] = useState<DestinationWithImageUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, [searchTerm, region, page]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const filters: DestinationSearchFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(region !== "all" && { region }),
      };
      const response = await destinationService.getAllDestinations(page, 12, filters);
      const transformedDestinations: DestinationWithImageUrl[] = response.destinations.map((destination) => ({
        ...destination,
        imageUrl: destination.featured_image || destination.image || "https://via.placeholder.com/300", // Ensure imageUrl is always a string
      }));
      if (page === 1) {
        setDestinations(transformedDestinations);
      } else {
        setDestinations((prev) => [...prev, ...transformedDestinations]);
      }
      setTotalPages(response.total_pages);
      setHasMore(page < response.total_pages);
    } catch (error: any) {
      console.error("Failed to fetch destinations:", error);
      toast.error("Failed to load destinations", {
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleRegionChange = (region: string) => {
    setRegion(region);
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Destinations</h1>
          <p className="text-gray-600">
            Discover vibrant cultures, stunning landscapes, and unforgettable adventures.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <Select value={region} onValueChange={handleRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="south-america">South America</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="oceania">Oceania</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading && destinations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">Loading destinations...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Destination Grid */}
            {destinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-2xl text-gray-600 mb-4">No destinations found</p>
                <p className="text-gray-500 mb-8">Try adjusting your search criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRegion("all");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Loading...
                    </>
                  ) : (
                    "Load More Destinations"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DestinationsPage;
