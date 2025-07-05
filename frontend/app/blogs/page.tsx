"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Layers, Tag, Link, X, Loader2 } from "lucide-react";
import BlogCard from '@/components/BlogCard';
import { toast } from "sonner";
import { blogService, Blog, BackendBlog, BlogListResponse, BlogSearchParams } from '@/lib/api/services/blog';
import { ApiError } from '@/lib/api/types';

function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [backendBlogs, setBackendBlogs] = useState<BackendBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Convert backend blogs to BlogCard format using blog service
  const blogs: Blog[] = backendBlogs.map(blogService.convertBlogFormat);
  
  // Available categories from backend
  const categories = [
    "All", 
    "Travel Guide", 
    "Budget Travel", 
    "Adventure", 
    "Culture", 
    "Food", 
    "Tips", 
    "Destination Review", 
    "Travel Story"
  ];
  
  const tags = ["Adventure", "Culture", "Food", "Nature", "Tips", "Budget", "Luxury", "Solo Travel"];

  // Fetch blogs from backend using blog service
  const fetchBlogs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: BlogSearchParams = {
        page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (activeCategory && activeCategory !== 'All') params.category = activeCategory;
      
      console.log('🚀 Fetching blogs with params:', params);
      
      const response = await blogService.getPublicBlogs(params);
      
      if (response.success && response.data) {
        console.log('✅ Blogs fetched successfully:', response.data);
        setBackendBlogs(response.data.blogs || []);
        setPagination({
          page: response.data.page || 1,
          pages: response.data.total_pages || 1,
          total: response.data.total || 0,
          limit: response.data.limit || 12
        });
      } else {
        throw new Error('Failed to fetch blogs');
      }
      
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      
      let errorMessage = 'Failed to fetch blogs';
      if (err && typeof err === 'object' && 'message' in err) {
        const apiError = err as ApiError;
        if (apiError.message.includes('Failed to fetch') || apiError.message.includes('Network connection error')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          errorMessage = apiError.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setBackendBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs locally for tags (since backend doesn't support tag filtering yet)
  const filteredBackendBlogs = React.useMemo(() => {
    if (activeTags.length === 0) return backendBlogs;
    
    return backendBlogs.filter(blog => 
      blog.tags && blog.tags.some((tag: string) => activeTags.includes(tag))
    );
  }, [backendBlogs, activeTags]);

  // Convert filtered backend blogs to BlogCard format
  const filteredBlogs: Blog[] = filteredBackendBlogs.map(blogService.convertBlogFormat);

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };
  
  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setActiveTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveCategory("All");
    setActiveTags([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBlogs(1); // Reset to first page when search/category changes
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeCategory]); // Fixed: removed pagination.limit dependency

  // Initial load
  useEffect(() => {
    fetchBlogs(1);
  }, []); // Fixed: empty dependency array for initial load only

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchBlogs(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-tl from-blue-500 to-indigo-600 py-10 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-[Bebas_Neue] text-5xl md:text-6xl font-headline text-white mb-6">Travel Chronicles</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Journey through our stories, tips, and inspirations from around the globe.
            </p>
        </div>
      </div>

      {/* Blog Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-6 self-start">
          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-300/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Search className="h-5 w-5 mr-2" /> Search Blogs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="h-10 px-4 rounded-lg bg-blue-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-colors duration-200 pr-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {(searchTerm || activeCategory !== "All" || activeTags.length > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {loading ? 'Searching...' : `${filteredBlogs.length} results`}
                    </span>
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-300/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Layers className="h-5 w-5 mr-2" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {categories.map(category => (
                  <li key={category} className="mb-1">
                    <button
                      onClick={() => handleCategoryClick(category)}
                      disabled={loading}
                      className={`w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center disabled:opacity-50 ${
                        activeCategory === category
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-muted-foreground hover:bg-blue-50"
                      }`}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      <span>{category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl bg-gradient-to-t from-white to-blue-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center text-primary">
                <Tag className="h-5 w-5 mr-2" /> Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 border ${
                    activeTags.includes(tag)
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "bg-yellow-500/20 text-primary hover:bg-yellow-500/20 border-yellow-500/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Blog Content */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchBlogs(pagination.page)}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading && backendBlogs.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Loading blogs...</p>
              </div>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog.slug} blog={blog} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && activeTags.length === 0 && (
                <div className="mt-12 flex justify-center">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                      className="py-2 px-4 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Fixed pagination numbers calculation */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let startPage = Math.max(1, pagination.page - 2);
                      const endPage = Math.min(pagination.pages, startPage + 4);
                      
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      
                      const page = startPage + i;
                      
                      if (page > pagination.pages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`py-2 px-4 border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed ${
                            pagination.page === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }).filter(Boolean)}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages || loading}
                      className="py-2 px-4 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-blue-50/50 rounded-lg">
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching blogs found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogsPage;
