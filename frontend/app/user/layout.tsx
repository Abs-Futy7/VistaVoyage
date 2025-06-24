
import { Heart, ListOrdered, UserCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {


 const userSideNavbar=[
  { title: 'My Profile', link: '/user/profile', icons: <UserCircle className="h-4 w-4 mr-2" /> },
  { title: 'My Bookings', link: '/user/bookings', icons: <ListOrdered className="h-4 w-4 mr-2" /> },
  { title: 'My Wishlist', link: '/user/wishlist', icons: <Heart className="h-4 w-4 mr-2" /> },
]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 lg:w-80 flex-shrink-0 rounded-lg">
            <div className="sticky top-24 bg-card p-6 rounded-lg shadow-sm shadow-blue-400/50">
              <h2 className="text-xl font-headline font-semibold mb-6 text-primary">My Account</h2>
              <nav className="space-y-2">
                {userSideNavbar.map((item) => (
                    <Link key={item.title} href={item.link} className='flex py-2 rounded-lg bg-gray-100 items-center px-3 text-blue-700 text-lg hover:bg-gray-200'>
                      {item.icons}
                      {item.title}
                    </Link>
                ))}
              </nav>
            </div>
          </aside>
            <main className="flex-grow">
                {children}
            </main>
        </div>
      </div>

  )
}

export default layout
