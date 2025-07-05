"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Loader2,
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
import { toast } from "sonner";
import { offerService, Offer } from "@/lib/api/services/offers";
import { promoCodeService, PromoCode } from "@/lib/api/services/promocode";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function OfferPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("all");
  const [tripType, setTripType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("expiryDate");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchOffersAndPromos();
    // eslint-disable-next-line
  }, [page, searchTerm]);

  const fetchOffersAndPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [offersRes, promoRes] = await Promise.all([
        offerService.getOffers(page, 9, searchTerm),
        promoCodeService.getPromoCodes(),
      ]);
      setOffers((prev) => (page === 1 ? offersRes.offers || [] : [...prev, ...(offersRes.offers || [])]));
      setPromoCodes(promoRes.promo_codes || []);
      setTotalPages(offersRes.total_pages || 1);
      setHasMore(page < (offersRes.total_pages || 1));
    } catch (e: any) {
      setError("Failed to load offers or promo codes.");
      toast.error("Failed to load offers or promo codes", { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting
  useEffect(() => {
    let results = offers;
    // Remove search filter here, since searchTerm is already used in API call
    if (sortBy === "expiryDate") {
      results = results.slice().sort(
        (a, b) => new Date(a.valid_until || '').getTime() - new Date(b.valid_until || '').getTime()
      );
    } else if (sortBy === "discount") {
      results = results.slice().sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    } else if (sortBy === "price") {
      results = results.slice().sort((a, b) => (a.discount_amount || 0) - (b.discount_amount || 0));
    }
    setFilteredOffers(results);
  }, [offers, sortBy]);

  // Copy promo code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        <p className="mt-2 text-gray-600">Loading offers...</p>
      </div>
    );
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

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
              <label htmlFor="search-offers" className="block text-sm font-medium text-gray-700 mb-1 ">
                Search Offers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search-offers"
                  type="text"
                  placeholder="Search by title..."
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
              <label htmlFor="filter-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger id="filter-price" className="h-11 w-full md:w-[150px] bg-gray-100 border border-gray-300 rounded-lg">
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
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="h-11 w-full md:w-[180px] bg-gray-100 border border-gray-300 rounded-lg">
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
            {promoCodes.length === 0 && <div className="col-span-3 text-center text-gray-500">No promo codes available.</div>}
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-lg border border-yellow-200 overflow-hidden shadow-md"
              >
                <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
                  <span className="font-mono font-bold text-xl text-yellow-800">
                    {promo.code}
                  </span>
                  <button
                    className={cn(
                      "px-3 py-1 h-auto",
                      copiedCode === promo.code && "bg-green-100 text-green-700"
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
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}% off`
                      : `$${promo.discount_value} off`}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Expires:</span>{" "}
                    {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString() : "-"}
                  </p>
                  {promo.description && (
                    <p className="text-xs text-gray-500 mt-1">{promo.description}</p>
                  )}
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
            {filteredOffers.length === 0 && <div className="col-span-3 text-center text-gray-500">No offers available.</div>}
            {(filteredOffers as any[]).map((offer: any) => (
              <motion.div
                key={offer.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="p-5 flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                      {offer.discount_percentage}% OFF
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{offer.destination || "Global"}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-[Bebas_Neue]">{offer.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>
                        {offer.valid_from && offer.valid_until
                          ? `${new Date(offer.valid_from).toLocaleDateString()} - ${new Date(offer.valid_until).toLocaleDateString()}`
                          : "Limited Time"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>
                        Until {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {offer.description || "Special limited-time offer with great savings!"}
                  </p>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-500 line-through text-sm">
                          ${offer.discount_amount ? (offer.discount_amount + (offer.discount_percentage || 0) * 10).toFixed(2) : "999.99"}
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${offer.discount_amount ? offer.discount_amount.toFixed(2) : "799.99"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Load More Offers"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function OfferPageWithAuth() {
  return (
    <ProtectedRoute message="You need to login to view exclusive offers and promo codes">
      <OfferPage />
    </ProtectedRoute>
  );
}
