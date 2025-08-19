"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from './ui/moving-border'
import HomePackageCard from './ui/HomePackageCard'
import { apiClient } from '@/lib/api/client'

interface PublicPackage {
  id: string
  title: string
  description: string
  price: number
  duration_days: number
  duration_nights: number
  featured_image?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  destination_id: string
  // ...add other fields as needed
}

// Add loading skeleton component
const PackageCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
    <div className="bg-gray-300 h-4 rounded mb-2"></div>
    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
  </div>
);

function PopularPackages() {
  const [packages, setPackages] = useState<PublicPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<PublicPackage[] | { packages: PublicPackage[] }>(
        '/api/v1/home/packages?page=1&limit=4'
      )
      // If backend returns an array directly
      if (Array.isArray(response.data)) {
        setPackages(response.data)
      } else if (response.data && Array.isArray((response.data as any).packages)) {
        setPackages((response.data as { packages: PublicPackage[] }).packages)
      } else {
        setPackages([])
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching packages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Memoize transformed package data
  const transformedPackages = useMemo(() => {
    return packages.slice(0, 4).map((pkg) => {
      // Only block URLs we know are definitely invalid
      const imageUrl = pkg.featured_image;
      const isInvalidImage = imageUrl && (
        imageUrl.includes('tywqqefmllgseuvdvoia.supabase.co') ||
        imageUrl.includes('example.com')
      );
      
      console.log(`PopularPackages: ${pkg.title} - Original: ${imageUrl}, IsInvalid: ${isInvalidImage}`);
      
      return {
        id: pkg.id,
        title: pkg.title,
        imageUrl: isInvalidImage ? '/images/travel-placeholder.svg' : (imageUrl || '/images/travel-placeholder.svg'),
        price: pkg.price,
      };
    });
  }, [packages])

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-2 text-blue-500">
            Popular Travel Packages
          </h2>
          <p className="text-lg  max-w-2xl mx-auto text-gray-700">
            Choose from our most sought-after travel experiences.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, index) => (
              <PackageCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {transformedPackages.map((packageInfo) => (
              <HomePackageCard key={packageInfo.id} {...packageInfo} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Button size="lg" className="font-[Bebas_Neue] mx-auto text-blue-800 bg-white/60 border-blue-800 hover:bg-white/80 transition-colors text-xl">
            <Link href="/packages">View All Packages</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default PopularPackages
