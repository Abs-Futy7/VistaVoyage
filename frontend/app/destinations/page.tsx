"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin, X } from "lucide-react";
import DestinationCard from "@/components/ui/DestinationCard";
import { destinationService, Destination, DestinationSearchFilters } from "@/lib/api/services/destinations";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Define a type for destinations that have guaranteed imageUrl
type DestinationWithImageUrl = Omit<Destination, 'imageUrl'> & { imageUrl: string };

function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [destinations, setDestinations] = useState<DestinationWithImageUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDestinations(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    fetchDestinations(1);
  }, []);

  const fetchDestinations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: DestinationSearchFilters = {
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await destinationService.getAllDestinations(page, pagination.limit, filters);
      const transformedDestinations: DestinationWithImageUrl[] = response.destinations.map((destination) => ({
        ...destination,
        imageUrl: destination.featured_image || destination.image || "https://via.placeholder.com/300",
      }));
      
      setDestinations(transformedDestinations);
      setPagination({
        page: response.page || 1,
        pages: response.total_pages || 1,
        total: response.total || 0,
        limit: pagination.limit
      });
    } catch (error: any) {
      console.error("Failed to fetch destinations:", error);
      setError(error.message || "Failed to load destinations");
      toast.error("Failed to load destinations", {
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchDestinations(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-tl from-blue-500 to-indigo-600 py-10 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[Bebas_Neue] text-5xl md:text-7xl font-headline text-white mb-6">Amazing Destinations</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover breathtaking places, vibrant cultures, and unforgettable adventures around the world.
          </p>
        </div>
      </div>

      {/* Destinations Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-6 self-start">
          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-300/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Search className="h-5 w-5 mr-2" /> Search Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search destinations..." 
                  className="h-10 px-4 rounded-lg bg-blue-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-colors duration-200 pr-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {searchTerm && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {loading ? 'Searching...' : `${destinations.length} results`}
                    </span>
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <MapPin className="h-5 w-5 mr-2" /> Explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover amazing destinations from around the world. Each place offers unique experiences, culture, and memories waiting to be made.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Main Destinations Content */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchDestinations(pagination.page)}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading && destinations.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Loading destinations...</p>
              </div>
            </div>
          ) : destinations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                      className="py-2 px-4 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let startPage = Math.max(1, pagination.page - 2);
                      const endPage = Math.min(pagination.pages, startPage + 4);
                      
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      
                      const page = startPage + i;
                      
                      if (page > pagination.pages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`py-2 px-4 border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed ${
                            pagination.page === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }).filter(Boolean)}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages || loading}
                      className="py-2 px-4 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-blue-50/50 rounded-lg">
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No destinations found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'No destinations found matching your search.' : 'No destinations available at the moment.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DestinationsPageWithAuth() {
  return (
    <ProtectedRoute message="You need to login to view destinations">
      <DestinationsPage />
    </ProtectedRoute>
  );
}
