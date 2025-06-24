import { mockPackages } from '@/utils/contants'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/moving-border'
import PackageCard from './ui/PackageCard'

function PopularPackages() {
  return (
    <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-2 text-blue-500">Popular Travel Packages</h2>
            <p className="text-lg  max-w-2xl mx-auto text-gray-700">
              Choose from our most sought-after travel experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {mockPackages.slice(0, 4).map((pkg) => (
              <PackageCard key={pkg.id} packageInfo={pkg} />
            ))}
          </div>
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
