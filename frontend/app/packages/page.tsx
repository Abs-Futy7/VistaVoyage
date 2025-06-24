"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { LuListFilter } from "react-icons/lu";
import PackageCard from "@/components/ui/PackageCard";
import { mockPackages } from "@/utils/contants";


function PackageListingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("any");
  const [tripType, setTripType] = useState("any");
  const [filteredPackages, setFilteredPackages] = useState(mockPackages);

  
  useEffect(() => {
    const filtered = mockPackages.filter((packageItem) => {
      // Search term filter
      const searchMatch =
        searchTerm === "" ||
        packageItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packageItem.destination
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Price range filter
      let priceMatch = true;
      if (priceRange !== "any") {
        if (priceRange === "<500" && packageItem.price >= 500)
          priceMatch = false;
        else if (
          priceRange === "500-1000" &&
          (packageItem.price < 500 || packageItem.price > 1000)
        )
          priceMatch = false;
        else if (
          priceRange === "1000-2000" &&
          (packageItem.price < 1000 || packageItem.price > 2000)
        )
          priceMatch = false;
        else if (priceRange === ">2000" && packageItem.price <= 2000)
          priceMatch = false;
      }

     
      const typeMatch = tripType === "any" || packageItem.tripType === tripType;

      return searchMatch && priceMatch && typeMatch;
    });

    setFilteredPackages(filtered);
  }, [searchTerm, priceRange, tripType]);

 
  const handleApplyFilters = () => {
    // You could add additional logic here if needed
    console.log("Filters applied:", { searchTerm, priceRange, tripType });
  };

  return (
    <div className="min-h-screen">
      <div className="py-12 text-center bg-gradient-to-tl from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-headline mb-4 font-[Bebas_Neue]">
            Explore Our Travel Packages
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Find your perfect getaway from our wide selection of curated travel
            experiences.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ">
        {/* Search and Filter Bar */}
        <div className="mb-8 p-6 bg-gradient-to-t from-white to-blue-300/50 rounded-lg shadow-md border-1 border-gray-400/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label
                htmlFor="destination-search"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Search Destination or Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 " />
                <input
                  type="text"
                  id="destination-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Paris, Beach, Adventure"
                  className="pl-10 h-11 bg-gray-100 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="price-range"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger
                  id="price-range"
                  className="h-11 bg-gray-100 border border-gray-300 rounded-lg"
                >
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent className="w-48 bg-blue-100 cursor-pointer border-b-1">
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="<500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
                  <SelectItem value=">2000">Over $2000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="trip-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trip Type
              </label>
              <Select>
                <SelectTrigger
                  id="trip-type"
                  className="h-11 bg-gray-100 border border-gray-300 rounded-lg"
                >
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent className="w-48 bg-blue-100 cursor-pointer border-b-1">
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="relaxation">Relaxation</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={handleApplyFilters}
              className="md:col-span-2 lg:col-span-1 bg-blue-600 hover:bg-blue-700 text-white h-11 w-full mt-4 md:mt-0 flex items-center justify-center rounded-lg cursor-pointer"
            >
              <LuListFilter className="mr-2 h-5 w-5" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <p className="text-gray-600 mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">{filteredPackages.length}</span>{" "}
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

        {/* Package Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((packageItem) => (
              <PackageCard key={packageItem.id} packageInfo={packageItem} />
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
                setTripType("any");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PackageListingPage;
