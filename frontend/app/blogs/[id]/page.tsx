"use client";

import React, { useEffect, useState } from 'react';
import { BlogComments, mockBlogs } from '@/utils/contants';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, MessageCircle, Globe, Tag, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function FullBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<any>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const resolvedParams = React.use(params);

  useEffect(() => {
    // Find the blog post with the matching ID
    const foundBlog = mockBlogs.find(blog => blog.slug === resolvedParams.id || blog.id === resolvedParams.id);
    if (foundBlog) {
      setBlog(foundBlog);
      
      // Find related blogs (same category or tags)
      const related = mockBlogs.filter(b => 
        b.id !== foundBlog.id && 
        (b.category === foundBlog.category || 
         (b.tags && foundBlog.tags && b.tags.some(tag => foundBlog.tags.includes(tag))))
      ).slice(0, 3);
      setRelatedBlogs(related);
    }
    setIsLoading(false);
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-6 w-36 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
          <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the blog post you're looking for. It may have been removed or the URL might be incorrect.
          </p>
          <Link href="/blogs">
            <button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blogs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Sample blog content - in a real app this would come from your backend
  const blogContent = `
  <p class="lead">
    Traveling opens doors to new experiences, cultures, and perspectives. It's a journey that transforms not just your location, but often your outlook on life.
  </p>
  
  <p>
    The gentle breeze whispered through the palm trees as I stepped onto the pristine beach of Koh Lanta. The turquoise waters stretched out before me, meeting the horizon in a seamless blend of blues. This wasn't just another destination; it was a revelation – one of Thailand's best-kept secrets that has managed to retain its authentic charm despite the country's booming tourism.
  </p>
  
  <h2>The Untouched Paradise</h2>
  
  <p>
    Unlike its more famous neighbors Phuket and Krabi, Koh Lanta offers a slower pace of life. The island stretches 30 kilometers from north to south, providing ample space for exploration without the crowds that plague other Thai beaches.
  </p>
  
  <p>
    The local community, primarily a mix of Thai-Chinese, original Thai, and Sea Gypsies, welcomes visitors with genuine smiles rather than tourist-oriented facades. Their traditions remain intact, offering cultural immersion opportunities rarely found in more developed destinations.
  </p>
  
  <blockquote>
    "Travel isn't always comfortable. Sometimes it hurts, it even breaks your heart. But that's okay. The journey changes you; it should change you."
    <cite>- Anthony Bourdain</cite>
  </blockquote>
  
  <h2>Culinary Delights Beyond Pad Thai</h2>
  
  <p>
    One cannot discuss Thailand without mentioning its world-renowned cuisine. However, beyond the familiar Pad Thai and Green Curry lies a world of local specialties that vary significantly by region. Koh Lanta's position as a fishing community means seafood takes center stage, prepared with traditional methods passed down through generations.
  </p>
  
  <p>
    The night markets of Saladan, particularly on weekends, offer a glimpse into authentic southern Thai cuisine. The spice levels here are not adjusted for foreign palates – a refreshing authenticity that culinary adventurers will appreciate.
  </p>
  
  <h2>Sustainable Tourism: A Model for the Future</h2>
  
  <p>
    Perhaps most impressive about Koh Lanta is its commitment to sustainable tourism. Local initiatives to preserve both natural environments and cultural heritage have created a model that other destinations would do well to follow.
  </p>
  
  <p>
    From coral reef protection programs to community-based tourism projects that ensure tourism benefits flow to local residents, Koh Lanta demonstrates that paradise need not be sacrificed at the altar of economic development.
  </p>
  
  <h2>Practical Tips for Visitors</h2>
  
  <ul>
    <li>The best time to visit is between November and April to avoid monsoon season</li>
    <li>Rent a motorbike to explore the island's diverse landscapes</li>
    <li>Visit the Old Town on the east coast for historical architecture and local crafts</li>
    <li>Take a four-island boat tour to experience the surrounding natural wonders</li>
    <li>Learn a few basic Thai phrases – locals truly appreciate the effort</li>
  </ul>
  
  <p>
    As responsible travelers, our choices matter. Destinations like Koh Lanta remind us that it's possible to experience extraordinary places without contributing to their deterioration. By supporting local businesses, respecting cultural norms, and treading lightly on the environment, we can help ensure these hidden gems remain for future generations of thoughtful explorers.
  </p>
  `;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with full-width image */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image
          src={blog.imageUrl || "/images/blog-default.jpg"}
          alt={blog.title}
          fill
          className="object-cover"
          priority
          data-ai-hint={blog.imageHint || "travel blog"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/blogs">
            <button className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-4">
              <ArrowLeft className="text-xl" />
            </button>
          </Link>
        </div>
        
        {/* Blog info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 text-white/90 mb-3">
              <Link 
                href={`/blogs?category=${blog.category}`} 
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                {blog.category || "Travel"}
              </Link>
              
              {blog.tags && blog.tags.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/blogs?tag=${tag}`}
                  className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-white mb-4 max-w-4xl">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-white/80 gap-x-6 gap-y-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 border-2 border-white">
                  <AvatarImage src="/images/avatar.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {blog.author?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span>{blog.author || "Anonymous"}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>
                  {new Date(blog.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>8 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">

          {/* Blog content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: blogContent }}
          />
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <Link 
                    key={tag} 
                    href={`/blogs?tag=${tag}`}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          
          
          {/* Comment section */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" /> 
              Comments (3)
            </h4>
            
            <div className="space-y-6">
              {BlogComments.map((comment, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {comment.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="font-medium text-gray-800">{comment.name}</h5>
                        <span className="text-xs text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{comment.content}</p>
                      <button className="text-blue-600 hover:text-blue-800 text-xs mt-2 font-medium">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Comment form */}
            <div className="mt-8">
              <h5 className="font-medium text-gray-800 mb-4">Leave a comment</h5>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                  />
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                  />
                </div>
                <textarea 
                  rows={4} 
                  placeholder="Your comment" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                ></textarea>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded-md transition-colors">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related posts */}
      {relatedBlogs.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-headline font-bold text-gray-800 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
}

export default FullBlogPage;
