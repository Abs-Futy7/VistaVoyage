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
import { LuListFilter } from "react-icons/lu";
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [searchTerm, priceRange, page]);

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
    imageUrl: pkg.featured_image || '/images/default-package.jpg',
    imageHint: `${pkg.title} - ${pkg.destination?.name || (pkg.destination as Destination)?.name || 'Unknown'}`,
    rating: 4.5, // TODO: Add rating system
  });

  // Fetch packages and enrich with destination
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const filters: PackageSearchFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange !== 'any' && getPriceFilter(priceRange)),
      };
      const response = await packageService.getAllPackages(page, 12, filters);
      // Fetch destination for each package in parallel
      const enrichedPackages = await Promise.all(
        response.packages.map(async (pkg) => {
          const { destination } = await fetchDestination(pkg);
          return { ...pkg, destination };
        })
      );
      if (page === 1) {
        setPackages(enrichedPackages);
      } else {
        setPackages((prev) => [...prev, ...enrichedPackages]);
      }
      setTotalPages(response.total_pages);
      setHasMore(page < response.total_pages);
    } catch (error: any) {
      console.error('Failed to fetch packages:', error);
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
    setPage(1);
  };

  const handlePriceChange = (range: string) => {
    setPriceRange(range);
    setPage(1);
  };



  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleApplyFilters = () => {
    // You could add additional logic here if needed
    console.log("Filters applied:", { searchTerm, priceRange });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Travel Packages
          </h1>
          <p className="text-gray-600">
            Discover amazing destinations and create unforgettable memories
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={handlePriceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="<500">Under $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1000</SelectItem>
                <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
                <SelectItem value=">2000">Over $2000</SelectItem>
              </SelectContent>
            </Select>



            {/* Filter Button */}
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <LuListFilter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <p className="text-gray-600 mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">{packages.length}</span>{" "}
            packages
          </p>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600 text-sm">Sort by:</span>
            <Select defaultValue="popular">
              <SelectTrigger className="h-9 w-40 text-sm bg-blue-200/20 border border-gray-300 rounded-lg">
                <SelectValue placeholder="Most Popular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading && packages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">Loading packages...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Package Grid */}
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((packageItem) => (
                  <PackageCard key={packageItem.id} packageInfo={transformPackageForCard(packageItem)} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-2xl text-gray-600 mb-4">No packages found</p>
                <p className="text-gray-500 mb-8">
                  Try adjusting your search criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPriceRange("any");
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
                    'Load More Packages'
                  )}
                </button>
              </div>
            )}

            {/* No Results */}
            {packages.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No packages found matching your criteria.
                </div>
                <p className="text-gray-400 mt-2">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </>
        )}
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
