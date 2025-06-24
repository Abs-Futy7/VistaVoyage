import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Cross, Heart, XCircle } from 'lucide-react'
import { mockPackages } from '@/utils/contants'
import PackageCard from '@/components/ui/PackageCard'
import { RxCrossCircled } from 'react-icons/rx'

function WishlistPage() {

const mockWishlistItems = mockPackages.slice(0,2); // assume korlam

  return (
    <Card className="shadow-sm shadow-blue-500/50 border border-blue-400/50 rounded-lg mx-auto">
      <CardHeader className="border-b border-blue-400">
         <div className="flex items-center space-x-4">
            <Heart className="h-10 w-10 text-blue-500" />
            <div>
                <CardTitle className="text-2xl font-headline">My Wishlist</CardTitle>
                <CardDescription>Your saved travel packages for future adventures.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {mockWishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockWishlistItems.map((pkg) => (
              <div key={pkg.id} className="relative group">
                <PackageCard packageInfo={pkg} />
                <button 
                  
                  className="absolute top-2 left-2"
                  title='Remove from Wishlist'

                  
                >
                   <RxCrossCircled className="h-4 w-4 text-black text-xl cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        ) : (
           <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">Your wishlist is empty.</p>
            <p className="text-sm text-muted-foreground mt-2">Start adding packages you love!</p>
            <button className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/packages">Explore Packages</Link>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WishlistPage