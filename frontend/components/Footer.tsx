import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { CiMapPin } from 'react-icons/ci'
import { FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaTwitter } from 'react-icons/fa'
import { IoMdMail } from 'react-icons/io'

function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-white to-blue-200 text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and About */}
          <div className="space-y-4">
            <Link href="/" aria-label="VoyageVista Home">
              <Image
                src="/icons/logo.png"
                alt="VoyageVista Logo"
                width={120}
                height={100}
                className="inline-block text-xl"
              />
                <span className="text-2xl font-bold font-headline">VoyageVista</span>
            </Link>
            <p className="text-sm">
              Your trusted partner for unforgettable travel experiences. Explore the world with VoyageVista.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/packages" className="hover:text-blue-500 transition-colors">Packages</Link></li>
              <li><Link href="/destinations" className="hover:text-blue-500 transition-colors">Destinations</Link></li>
              <li><Link href="/blogs" className="hover:text-blue-500 transition-colors">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-blue-500 transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-headline font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CiMapPin className="h-5 w-5 mr-3 mt-0.5_ flex-shrink-0 text-primary" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center">
                <IoMdMail className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
                <a href="mailto:info@voyagevista.com" className="hover:text-primary transition-colors">info@voyagevista.com</a>
              </li>
              <li className="flex items-center">
                <FaPhone className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">+00 123 456 7890</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-lg font-headline font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-500 transition-colors"><FaFacebook className="h-6 w-6" /></Link>
              <Link href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-500 transition-colors"><FaTwitter className="h-6 w-6" /></Link>
              <Link href="#" aria-label="Instagram" className="text-gray-400 hover:text-blue-500 transition-colors"><FaInstagram className="h-6 w-6" /></Link>
              <Link href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-500 transition-colors"><FaLinkedin className="h-6 w-6" /></Link>
            </div>
          </div>
        </div>

        <hr className="my-8  border-blue-900" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VoyageVista. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
