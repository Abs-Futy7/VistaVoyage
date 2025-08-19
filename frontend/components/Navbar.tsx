"use client";
import { navLinks } from '@/utils/contants'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { IoIosMenu } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';
import { User, LogOut, Settings, ChevronDown, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from './auth/LogoutButton';
import { FastNavLink } from './FastNavLink';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading } = useAuth();
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setUserMenuOpen(false);
    }
  }, []);
  
  // Handle clicks outside the user menu to close it
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);
  
  // Memoize menu close handler
  const handleMenuClose = useCallback(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileAccountOpen(false);
  }, []);

  // Memoize toggle handlers
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prev => !prev);
  }, []);

  const toggleMobileAccount = useCallback(() => {
    setMobileAccountOpen(prev => !prev);
  }, []);

  // Memoize navigation links to prevent re-rendering
  const memoizedNavLinks = useMemo(() => navLinks, []);

  return (
    <div className='flex justify-between items-center px-4 bg-white text-gray-800 gap-3 sticky top-0 z-50 shadow-md backdrop-blur-md py-2'>
      <Link className='text-lg font-bold flex items-center' href='/'>
        <Image 
          src='/icons/logo.png' 
          alt='VoyageVista Logo' 
          width={100} 
          height={100} 
          className='inline-block text-2xl font-bold' 
        />
        Voyage<span className='text-blue-500'>Vista</span>
      </Link>
      
      <div className='space-x-2 hidden md:flex'>
        {memoizedNavLinks.map((link) => (
          <FastNavLink 
            key={link.href} 
            href={link.href} 
            className='hover:text-blue-800 transition-colors duration-200 text-md hover:font-semibold hover:bg-blue-200 py-1 px-3 rounded-lg'
          >
            {link.label}
          </FastNavLink>
        ))}
      </div>
      
      {/* Desktop auth buttons */}
      <div className='hidden lg:flex items-center space-x-2'>
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={toggleUserMenu}
              className='flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200'
            >
              <User className="h-4 w-4 mr-1" />
              My Account
              <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link 
                  href="/user/profile" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  onClick={handleMenuClose}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                
                <hr className="my-1 border-gray-200" />
                <div className="px-2 py-1">
                  <LogoutButton 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600 px-2 py-1 text-sm"
                    showConfirmation={false}
                  >
                    Logout
                  </LogoutButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href='/auth/login' className='hover:bg-blue-500 hover:text-white transition-colors duration-200 border border-blue-500 py-2 px-4 rounded-2xl'>Login</Link>
            <Link href='/auth/register' className='bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition-colors duration-200'>Sign Up</Link>
          </>
        )}
      </div>
      
      {/* Mobile menu button */}
      <button 
        className='md:hidden text-gray-800 focus:outline-none cursor-pointer hover:text-blue-500 transition-colors duration-200'
        onClick={toggleMobileMenu}
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
          {memoizedNavLinks.map((link) => (
            <FastNavLink 
              key={link.href} 
              href={link.href} 
              className='hover:text-blue-500 transition-colors duration-200 text-md hover:font-semibold py-2 border-b border-gray-200'
            >
              {link.label}
            </FastNavLink>
          ))}
          
          {/* Account section in mobile menu */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-2 mt-1">
              {/* My Account button in mobile view */}
              <button 
                onClick={toggleMobileAccount}
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
                    onClick={handleMenuClose}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  
                  <div className="px-2 py-1">
                    <LogoutButton 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600 px-0 py-1 text-sm"
                      showConfirmation={false}
                    >
                      Logout
                    </LogoutButton>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3 mt-2 border-t border-gray-200 pt-3'>
              <Link 
                href='/auth/login' 
                className='hover:bg-blue-500 hover:text-white transition-colors duration-200 border border-blue-500 py-2 px-4 rounded-2xl text-center'
                onClick={handleMenuClose}
              >
                Login
              </Link>
              <Link 
                href='/auth/register' 
                className='bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition-colors duration-200 text-center'
                onClick={handleMenuClose}
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
