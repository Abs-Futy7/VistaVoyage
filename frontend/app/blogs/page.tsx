"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Layers, Tag, Link, X } from "lucide-react";
import BlogCard from '@/components/BlogCard';
import { mockBlogs } from '@/utils/contants';

function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState(mockBlogs);
  
  // Categories and tags data
  const categories = ["All", "Destinations", "Travel Tips", "Guides", "Experiences", "Photography"];
  const tags = ["Adventure", "Culture", "Food", "Nature", "Tips"];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
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
  };

  // Filter blogs based on search, category and tags
  useEffect(() => {
    const filtered = mockBlogs.filter(blog => {
      // Search term filter
      const searchMatch = searchTerm === "" || 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const categoryMatch = activeCategory === "All" || 
        (blog.category?.toLowerCase() === activeCategory.toLowerCase());
      
      // Tags filter
      const tagsMatch = activeTags.length === 0 || 
        (blog.tags && blog.tags.some(tag => activeTags.includes(tag)));
      
      return searchMatch && categoryMatch && tagsMatch;
    });
    
    setFilteredBlogs(filtered);
  }, [searchTerm, activeCategory, activeTags]);

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
                      {filteredBlogs.length} results
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
                      className={`w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center ${
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
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
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
          
          {/* Pagination for larger blog collections */}
          {filteredBlogs.length > 9 && (
            <div className="mt-12 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
                  Previous
                </a>
                <a href="#" className="py-2 px-4 bg-blue-600 text-white border border-blue-600">
                  1
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50">
                  3
                </a>
                <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
                  Next
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogsPage;
