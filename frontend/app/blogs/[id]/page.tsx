"use client";

import React, { useEffect, useState } from 'react';
import { BlogComments } from '@/utils/contants';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, Globe, Facebook, Twitter, Linkedin, Mail, Loader2, Eye, Tag, BookOpen, ChevronRight } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { blogService, BackendBlog, Blog } from '@/lib/api/services/blog';

function FullBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<BackendBlog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center p-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Article</h2>
          <p className="text-gray-600">Preparing your reading experience...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="max-w-md mx-auto shadow-xl border-0">
          <CardContent className="text-center p-8">
            <Globe className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {error === 'Blog not found' ? 'Article Not Found' : 'Loading Error'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Blog not found' 
                ? "The article you're looking for seems to have wandered off on its own adventure."
                : error || "Something went wrong while loading the article."
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/blogs">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Browse Articles
                </Button>
              </Link>
              {error !== 'Blog not found' && (
                <Button 
                  variant="outline"
                  onClick={() => fetchBlogDetails(resolvedParams.id)}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <Image
          src={blog.cover_image || "/images/blog.jpg"}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
          data-ai-hint={`${blog.category} travel blog`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Floating Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/blogs">
            <Button 
              size="lg"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-full h-12 w-12 p-0 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <Button
            size="lg"
            variant={bookmarked ? "default" : "secondary"}
            onClick={() => setBookmarked(!bookmarked)}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-full h-12 w-12 p-0 transition-all duration-300"
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="lg"
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white rounded-full h-12 w-12 p-0 transition-all duration-300"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Blog Header Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-blue-600/90 hover:bg-blue-700/90 text-white border-0 text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                <Tag className="h-3 w-3 mr-1.5" />
                {blog.category || "Travel"}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-5xl leading-tight tracking-tight">
              {blog.title}
            </h1>
            
            {/* Author and Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-white/30">
                  <AvatarImage src="/images/avatar.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {blog.author_name ? blog.author_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AU'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{blog.author_name || 'Travel Expert'}</p>
                  <p className="text-white/70 text-sm">Travel Blogger</p>
                </div>
              </div>
              
              <div className="h-6 w-px bg-white/30 hidden md:block"></div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{calculateReadingTime(blog.content)} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Share Options Dropdown */}
        {showShareOptions && (
          <div className="absolute top-20 right-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank');
                }}
                className="p-3 rounded-xl hover:bg-blue-50 text-blue-500"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank');
                }}
                className="p-3 rounded-xl hover:bg-blue-50 text-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank');
                }}
                className="p-3 rounded-xl hover:bg-blue-50 text-blue-700"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                  toast.success('Link copied to clipboard!');
                  setShowShareOptions(false);
                }}
                className="p-3 rounded-xl hover:bg-gray-50 text-gray-600"
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="space-y-8">
          {/* Blog Excerpt */}
          {blog.excerpt && (
            <Card className="border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-transparent shadow-sm">
              <CardContent className="p-6">
                <p className="text-xl text-gray-700 font-medium leading-relaxed italic">
                  "{blog.excerpt}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Blog Content */}
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-8 md:p-12">
              <div 
                className="prose prose-xl max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 
                  prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:font-medium
                  prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                  prose-li:text-gray-700 prose-li:text-lg prose-li:my-2
                  prose-strong:text-gray-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: formatBlogContent(blog.content) }}
              />
            </CardContent>
          </Card>

          {/* Author Bio Card */}
          <Card className="shadow-sm border border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src="/images/avatar.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                    {blog.author_name ? blog.author_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AU'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="mt-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{blog.author_name || 'Travel Expert'}</h3>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Enhanced Related Posts */}
      {relatedBlogs.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Continue Reading</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover more amazing travel stories and insider tips from our expert writers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedBlogs.map(relatedBlog => (
                <div key={relatedBlog.slug} className="transform hover:scale-105 transition-transform duration-300">
                  <BlogCard blog={relatedBlog} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FullBlogPage;
