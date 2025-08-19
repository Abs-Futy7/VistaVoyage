"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Package, X, MapPin, Filter } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import PackageCard from "@/components/ui/PackageCard";
import { packageService, PublicPackage, PackageSearchFilters } from "@/lib/api/services/packages";
import { destinationService, Destination } from '@/lib/api/services/destinations';
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";


function PackageListingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("any");
  const [packages, setPackages] = useState<PublicPackage[]>([]);
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
      fetchPackages(1); // Reset to first page when search/filters change
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, priceRange]);

  // Initial load
  useEffect(() => {
    fetchPackages(1);
  }, []);

  // Helper to fetch destination for a package
  const fetchDestination = async (pkg: PublicPackage) => {
    let destination: Destination | undefined = undefined;
    try {
      if (pkg.destination_id) {
        destination = await destinationService.getDestinationById(pkg.destination_id);
      }
    } catch {}
    return { destination };
  };

  // Transform package for card with destination info
  const transformPackageForCard = (pkg: PublicPackage & { destination?: Destination }) => ({
    id: pkg.id,
    title: pkg.title,
    destination: pkg.destination
      ? `${pkg.destination.name}, ${pkg.destination.country}`
      : (pkg.destination ? `${(pkg.destination as Destination).name}, ${(pkg.destination as Destination).country}` : 'Unknown destination'),
    price: pkg.price,
    duration: `${pkg.duration_days} days`,
    imageUrl: (() => {
      // Clean up the image URL by removing trailing ? character and trimming whitespace
      let cleanedUrl = pkg.featured_image;
      
      if (cleanedUrl) {
        // Trim whitespace and remove trailing ? or other URL params
        cleanedUrl = cleanedUrl.trim();
        if (cleanedUrl.endsWith('?')) {
          cleanedUrl = cleanedUrl.slice(0, -1);
        }
        // Ensure it's a valid URL string
        cleanedUrl = cleanedUrl.trim();
        
        // Additional validation - check if URL looks valid
        if (!cleanedUrl.startsWith('http')) {
          console.log(`🔧 Package Card: Invalid URL format for ${pkg.title}: "${cleanedUrl}"`);
          cleanedUrl = '';
        }
      }
      
      const finalUrl = cleanedUrl || '/images/travel-placeholder.svg';
      console.log(`🔧 Package ${pkg.title}: Original: "${pkg.featured_image}", Cleaned: "${cleanedUrl}", Final: "${finalUrl}"`);
      return finalUrl;
    })(),
    imageHint: `${pkg.title} - ${pkg.destination?.name || (pkg.destination as Destination)?.name || 'Unknown'}`,
  });

  // Fetch packages and enrich with destination
  const fetchPackages = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: PackageSearchFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange !== 'any' && getPriceFilter(priceRange)),
      };
      
      const response = await packageService.getAllPackages(page, pagination.limit, filters);
      
      // Fetch destination for each package in parallel
      const enrichedPackages = await Promise.all(
        response.packages.map(async (pkg) => {
          const { destination } = await fetchDestination(pkg);
          return { ...pkg, destination };
        })
      );
      
      setPackages(enrichedPackages);
      setPagination({
        page: response.page || 1,
        pages: response.total_pages || 1,
        total: response.total || 0,
        limit: pagination.limit
      });
    } catch (error: any) {
      console.error('Failed to fetch packages:', error);
      setError(error.message || "Failed to load packages");
      toast.error('Failed to load packages', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriceFilter = (range: string) => {
    switch (range) {
      case "<500":
        return { max_price: 500 };
      case "500-1000":
        return { min_price: 500, max_price: 1000 };
      case "1000-2000":
        return { min_price: 1000, max_price: 2000 };
      case ">2000":
        return { min_price: 2000 };
      default:
        return {};
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePriceChange = (range: string) => {
    setPriceRange(range);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange("any");
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPackages(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through useEffect
    console.log("Filters applied:", { searchTerm, priceRange });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-tl from-blue-500 to-indigo-600 py-10 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[Bebas_Neue] text-5xl md:text-7xl font-headline text-white mb-6">Travel Packages</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover amazing destinations and create unforgettable memories with our curated travel packages.
          </p>
        </div>
      </div>

      {/* Packages Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-6 self-start">
          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-300/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Search className="h-5 w-5 mr-2" /> Search Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search packages..." 
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
                      {loading ? 'Searching...' : `${packages.length} results`}
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
                <Filter className="h-5 w-5 mr-2" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                <Select value={priceRange} onValueChange={handlePriceChange}>
                  <SelectTrigger className="bg-blue-50 border-gray-300">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    <SelectItem value="<500">Under TK 500</SelectItem>
                    <SelectItem value="500-1000">TK 500 - TK 1000</SelectItem>
                    <SelectItem value="1000-2000">TK 1000 - TK 2000</SelectItem>
                    <SelectItem value=">2000">Over TK 2000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || priceRange !== 'any') && (
                <button 
                  onClick={clearFilters}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Package className="h-5 w-5 mr-2" /> Explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover curated travel packages designed to give you the best experiences around the world. Each package includes accommodations, activities, and memories to last a lifetime.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Main Packages Content */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchPackages(pagination.page)}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading && packages.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Loading packages...</p>
              </div>
            </div>
          ) : packages.length > 0 ? (
            <>
              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{packages.length}</span> of <span className="font-semibold">{pagination.total}</span> packages
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((packageItem) => {
                  const transformedPackage = transformPackageForCard(packageItem);
                  console.log('Rendering package:', transformedPackage.title, 'Image URL:', transformedPackage.imageUrl);
                  return (
                    <PackageCard key={packageItem.id} packageInfo={transformedPackage} />
                  );
                })}
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
                <Package className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'No packages found matching your search.' : 'No packages available at the moment.'}
                </p>
                {(searchTerm || priceRange !== 'any') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
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

export default function PackagesPage() {
  return (
    <ProtectedRoute message="You need to login to view travel packages">
      <PackageListingPage />
    </ProtectedRoute>
  );
}
