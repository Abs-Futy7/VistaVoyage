"use client";

import React, { useEffect, useState } from 'react';
import { BlogComments } from '@/utils/contants';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, MessageCircle, Globe, Tag, Facebook, Twitter, Linkedin, Mail, Loader2 } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner";
import { blogService, BackendBlog, Blog } from '@/lib/api/services/blog';

function FullBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<BackendBlog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const resolvedParams = React.use(params);

  // Fetch blog details from backend using blog service
  const fetchBlogDetails = async (blogId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Fetching blog details for ID:', blogId);
      
      const response = await blogService.getBlogById(blogId);
      
      if (response.success && response.data) {
        console.log('✅ Blog data received:', response.data);
        setBlog(response.data);
        
        // Fetch related blogs
        await fetchRelatedBlogs(response.data.category);
      } else {
        throw new Error('Failed to fetch blog details');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching blog:', err);
      if (err.status === 404) {
        setError('Blog not found');
      } else {
        setError(err.message || 'Failed to fetch blog');
      }
      toast.error('Failed to load blog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch related blogs by category using blog service
  const fetchRelatedBlogs = async (category: string) => {
    try {
      console.log('🔍 Fetching related blogs for category:', category);
      
      const response = await blogService.getPublicBlogs({
        category: category,
        limit: 3
      });
      
      if (response.success && response.data) {
        const convertedBlogs = (response.data.blogs || [])
          .filter((b: BackendBlog) => b.id !== resolvedParams.id) // Exclude current blog
          .slice(0, 3)
          .map(blogService.convertBlogFormat);
        setRelatedBlogs(convertedBlogs);
        console.log('✅ Related blogs fetched:', convertedBlogs.length);
      }
    } catch (err: any) {
      console.error('❌ Error fetching related blogs:', err);
      // Don't show error for related blogs, just continue without them
    }
  };

  useEffect(() => {
    if (resolvedParams.id) {
      fetchBlogDetails(resolvedParams.id);
    }
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading blog...</h2>
          <p className="text-gray-500">Please wait while we fetch the article</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
          <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {error === 'Blog not found' ? 'Blog Not Found' : 'Error Loading Blog'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Blog not found' 
              ? "We couldn't find the blog post you're looking for. It may have been removed or the URL might be incorrect."
              : error || "Something went wrong while loading the blog post."
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/blogs">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back to Blogs
              </button>
            </Link>
            {error !== 'Blog not found' && (
              <button 
                onClick={() => fetchBlogDetails(resolvedParams.id)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    return blogService.calculateReadingTime(content);
  };

  const formatBlogContent = (content: string) => {
    return blogService.formatBlogContent(content);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with full-width image */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image
          src={blog.cover_image || "/images/blog.jpg"}
          alt={blog.title}
          fill
          className="object-cover"
          priority
          data-ai-hint={`${blog.category} travel blog`}
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
                    TW
                  </AvatarFallback>
                </Avatar>
                <span>Travel Writer</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{calculateReadingTime(blog.content)} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">

          {/* Blog excerpt */}
          {blog.excerpt && (
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-lg text-gray-700 font-medium italic">{blog.excerpt}</p>
            </div>
          )}

          {/* Blog content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: formatBlogContent(blog.content) }}
          />
          
          {/* Share and action buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              
              {showShareOptions && (
                <div className="flex items-center gap-2 bg-white border rounded-lg p-2 shadow-lg">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-400 hover:bg-blue-50 rounded"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-700 hover:bg-blue-50 rounded"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <Bookmark className="h-4 w-4" />
              Save
            </button>
          </div>
          
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
              {relatedBlogs.map(relatedBlog => (
                <BlogCard key={relatedBlog.slug} blog={relatedBlog} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
}

export default FullBlogPage;
