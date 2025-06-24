"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DestinationCard from "@/components/ui/DestinationCard";
import { mockDestinations } from "@/utils/contants";
import { Search, Globe, Filter } from 'lucide-react';
import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/moving-border";

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [region, setRegion] = useState("all");
  const [filteredDestinations, setFilteredDestinations] = useState(mockDestinations);

  useEffect(() => {
  const filtered = mockDestinations.filter((dest) => {
    const searchMatch =
      searchTerm === "" ||
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase());

    const regionMatch =
      region === "all" ||
      dest.region?.toLowerCase() === region.toLowerCase();

    return searchMatch && regionMatch;
  });

  setFilteredDestinations(filtered);
}, [searchTerm, region]);

  return (
    <section className="min-h-screen ">
      <div className="bg-gradient-to-tl from-blue-500 to-indigo-600 text-white py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-[Bebas_Neue] text-5xl md:text-6xl font-headline font-bold text-white mb-4">
              Explore Destinations
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Discover vibrant cultures, stunning landscapes, and unforgettable adventures around the world.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filter Bar */}
        <div className="mb-8 p-6 bg-gradient-to-t from-white to-blue-300/50 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-grow w-full md:w-auto">
                <label htmlFor="destination-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Destinations
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    id="destination-search"
                    type="text" 
                    placeholder="Search by name, country..." 
                    className="pl-10 h-11 bg-gray-100 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    value={searchTerm}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
                  />
                </div>
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Region
              </label>
              <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger id="region-filter" className="h-12 w-full md:w-[200px] bg-gray-100 border border-gray-300 rounded-lg">
                    <SelectValue placeholder="All Regions" />
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

        {/* Destination Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <p className="text-xl text-gray-600 mb-6">
                No destinations found matching your criteria.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setRegion("all");
                  setFilteredDestinations(mockDestinations);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
        
      </div>
    </section>
  );
}
