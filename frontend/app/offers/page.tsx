"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Copy,
  TimerReset,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { promoCodes, specialOffers } from "@/utils/contants";

// Sample offer data - in a real app, this would come from your backend

function OfferPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("all");
  const [tripType, setTripType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("expiryDate");
  const [filteredOffers, setFilteredOffers] = useState(specialOffers);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Flash sale timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Filter offers based on search and filters
  useEffect(() => {
    let results = specialOffers.filter((offer) => {
      // Search filter
      const searchMatch =
      searchTerm === "" ||
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Destination filter
      const destinationMatch =
      destination === "all" ||
      offer.destination.toLowerCase().includes(destination.toLowerCase());
      
      // Trip type filter
      const tripTypeMatch = tripType === "all" || offer.tripType === tripType;
      
      // Price range filter
      let priceMatch = true;
      if (priceRange === "under1000") {
        priceMatch = offer.discountedPrice < 1000;
      } else if (priceRange === "1000to2000") {
        priceMatch =
        offer.discountedPrice >= 1000 && offer.discountedPrice <= 2000;
      } else if (priceRange === "above2000") {
        priceMatch = offer.discountedPrice > 2000;
      }
      
      return searchMatch && destinationMatch && tripTypeMatch && priceMatch;
    });
    
    // Sort results
    if (sortBy === "expiryDate") {
      results = results.sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
    } else if (sortBy === "discount") {
      results = results.sort(
        (a, b) => b.discountPercentage - a.discountPercentage
      );
    } else if (sortBy === "price") {
      results = results.sort((a, b) => a.discountedPrice - b.discountedPrice);
    }
    
    setFilteredOffers(results);
  }, [searchTerm, destination, tripType, priceRange, sortBy]);
  
  // Copy promo code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-tl from-blue-500 to-indigo-600">
        <div className="container mx-auto relative z-10 text-center">
          <h1 className="font-[Bebas_Neue] text-5xl md:text-6xl lg:text-7xl font-headline text-white mb-4">
            Explore the World with Our Best Deals!
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Grab our limited-time offers before they're gone. Exclusive discounts on dream destinations worldwide.
            </p>
        </div>
      </section>

        {/* Filter Section */}
        <section className="bg-white py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">
              <div className="w-full md:w-auto flex-grow">
                <label
                  htmlFor="search-offers"
                  className="block text-sm font-medium text-gray-700 mb-1 "
                >
                  Search Offers
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search-offers"
                    type="text"
                    placeholder="Search by destination, title..."
                    className="pl-10 h-11 bg-gray-100 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="filter-destination"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Destination
                </label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger
                    id="filter-destination"
                    className="h-11 w-full md:w-[160px] bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <SelectValue placeholder="All Destinations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    <SelectItem value="paris">Paris</SelectItem>
                    <SelectItem value="bali">Bali</SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                    <SelectItem value="greece">Greece</SelectItem>
                    <SelectItem value="tanzania">Tanzania</SelectItem>
                    <SelectItem value="switzerland">Switzerland</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="filter-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trip Type
                </label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger
                    id="filter-type"
                    className="h-11 w-full md:w-[150px] bg-gray-100"
                  >
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Romantic">Romantic</SelectItem>
                    <SelectItem value="Beach">Beach</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="filter-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price Range
                </label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger
                    id="filter-price"
                    className="h-11 w-full md:w-[150px] bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="under1000">Under $1000</SelectItem>
                    <SelectItem value="1000to2000">$1000 - $2000</SelectItem>
                    <SelectItem value="above2000">Above $2000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <label
                  htmlFor="sort-by"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    id="sort-by"
                    className="h-11 w-full md:w-[180px] bg-gray-100 border border-gray-300 rounded-lg"
                  >
                    <SelectValue placeholder="Expiring Soon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expiryDate">Expiring Soon</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Code Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-gray-800">
                <Tag className="inline-block mr-2" /> Current Promo Codes
              </h2>
              <p className="text-gray-600">
                Use these codes at checkout for extra savings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promoCodes.map((promo) => (
                <div
                  key={promo.code}
                  className="bg-white rounded-lg border border-yellow-200 overflow-hidden shadow-md"
                >
                  <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
                    <span className="font-mono font-bold text-xl text-yellow-800">
                      {promo.code}
                    </span>
                    <button
                      className={cn(
                        "px-3 py-1 h-auto",
                        copiedCode === promo.code &&
                          "bg-green-100 text-green-700"
                      )}
                      onClick={() => copyToClipboard(promo.code)}
                    >
                      {copiedCode === promo.code ? (
                        <>Copied! ✓</>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-1">
                      {promo.discount}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Expires:</span>{" "}
                      {new Date(promo.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Offers Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-headline font-bold text-gray-800 mb-8 text-center">
              Featured Offers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers
                .filter((offer) => offer.featured)
                .map((offer) => (
                  <motion.div
                    key={offer.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <div className="h-56 w-full relative overflow-hidden">
                        <Image
                          src={offer.imageUrl}
                          alt={offer.title}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-110"
                
                        />
                      </div>

                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold transform rotate-3 shadow-lg">
                        {offer.discountPercentage}% OFF
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="flex items-center text-white mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{offer.destination}</span>
                        </div>
                        <h3 className="text-3xl text-white font-[Bebas_Neue] ">
                          {offer.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 flex-grow bg-gradient-to-t from-white to-blue-200">
                      <div className="flex items-center justify-between mb-3 ">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>{offer.duration}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          <span>
                            Until{" "}
                            {new Date(offer.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {offer.summary}
                      </p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-gray-500 line-through text-sm">
                              ${offer.originalPrice}
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                              ${offer.discountedPrice}
                            </span>
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

  
    </div>
  );
}

export default OfferPage;
