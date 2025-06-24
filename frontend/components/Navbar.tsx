"use client";
import { navLinks } from '@/utils/contants'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { IoIosMenu } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';
import { User, LogOut, Settings, ChevronDown, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Check authentication status on component mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(auth);
    };
    
    // Check on mount
    checkAuth();
    
    // Listen for storage events (triggered by login/logout)
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);
  
  // Handle clicks outside the user menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    // Trigger storage event to update other components
    window.dispatchEvent(new Event("storage"));
    // Close menus
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileAccountOpen(false);
  };

  return (
    <div className='flex justify-between items-center px-4 bg-white text-gray-800 gap-3 sticky top-0 z-50 shadow-md backdrop-blur-md py-2'>
      <Link className='text-lg font-bold flex items-center' href='/'>
        <Image src='/icons/logo.png' alt='VoyageVista Logo' width={100} height={100} className='inline-block text-xl' />
        VoyageVista
      </Link>
      
      <div className='space-x-2 hidden md:flex'>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className='hover:text-blue-800 transition-colors duration-300 text-md hover:font-semibold hover:bg-blue-200 py-1 px-3 rounded-full'>
            {link.label}
          </Link>
        ))}
      </div>
      
      {/* Desktop auth buttons */}
      <div className='hidden lg:flex items-center space-x-2'>
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className='flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition-colors duration-300'
            >
              <User className="h-4 w-4 mr-1.5" />
              My Account
              <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link 
                  href="/user/profile" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link 
                  href="/user/wishlist" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Link>
                <Link 
                  href="/user/settings" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-200" />
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href='/auth/login' className='hover:bg-blue-500 hover:text-white transition-colors duration-300 border border-blue-500 py-2 px-4 rounded-2xl'>Login</Link>
            <Link href='/auth/register' className='bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600'>Sign Up</Link>
          </>
        )}
      </div>
      
      {/* Mobile menu button */}
      <button 
        className='md:hidden text-gray-800 focus:outline-none cursor-pointer hover:text-blue-500 transition-colors duration-300'
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <RxCross2 className='h-6 w-6' />
        ) : (
          <IoIosMenu className='h-6 w-6' />
        )}
      </button>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col gap-3'>
          {/* Navigation links */}
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className='hover:text-blue-500 transition-colors duration-300 text-md hover:font-semibold py-2 border-b border-gray-200'
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Account section in mobile menu */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-2 mt-1">
              {/* My Account button in mobile view */}
              <button 
                onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                className='w-full flex items-center justify-between px-2 py-3 hover:bg-blue-50 rounded-md'
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">My Account</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Expandable account menu */}
              {mobileAccountOpen && (
                <div className="ml-4 border-l-2 border-blue-100 pl-4 mt-1 mb-2 space-y-2">
                  <Link 
                    href='/user/profile' 
                    className='flex items-center px-2 py-2 hover:bg-blue-50 rounded-md'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link 
                    href='/user/wishlist' 
                    className='flex items-center px-2 py-2 hover:bg-blue-50 rounded-md'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Link>
                  <Link 
                    href='/user/settings' 
                    className='flex items-center px-2 py-2 hover:bg-blue-50 rounded-md'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='flex w-full items-center text-red-600 px-2 py-2 hover:bg-red-50 rounded-md'
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3 mt-2 border-t border-gray-200 pt-3'>
              <Link 
                href='/auth/login' 
                className='hover:bg-blue-500 hover:text-white transition-colors duration-300 border border-blue-500 py-2 px-4 rounded-2xl text-center'
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href='/auth/register' 
                className='bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 text-center'
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar
