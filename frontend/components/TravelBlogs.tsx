"use client";
import React from 'react'
import { Button } from './ui/moving-border'
import Link from 'next/link'
import BlogCard from './BlogCard'
import { FaPenFancy } from 'react-icons/fa'
import { useEffect, useState } from 'react';
import { blogService, Blog } from '@/lib/api/services/blog';


function TravelBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the correct service method and mapping
        const response = await blogService.getPublicBlogs({ page: 1, limit: 6 });
        if (response.success && response.data && Array.isArray(response.data.blogs)) {
          setBlogs(response.data.blogs.map(blogService.convertBlogFormat));
        } else {
          setBlogs([]);
        }
      } catch (e: any) {
        setError(e.message || "Error fetching blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-800 mb-2 text-center">
            Discover Our Latest <span className="text-blue-600">Travel Stories</span>
          </h2>
          <div className="w-[200px] h-1 bg-yellow-500  mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center">
            Get inspired with our handcrafted travel stories, expert tips, and comprehensive destination guides.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogs.map((blog) => (
              <div key={blog.slug} className="transform transition-all duration-300 hover:-translate-y-2">
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-16 text-center">
          <button 
            className="font-[Bebas_Neue] bg-gradient-to-r from-blue-500 to-blue-800 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/blogs" className="inline-flex items-center">
              Explore All Travel Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TravelBlogs
