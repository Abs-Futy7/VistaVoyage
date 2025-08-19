"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye, 
  Search, 
  Trash2, 
  FileText,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Star,
  Calendar
} from 'lucide-react';
import { useAdminBlogs } from '@/hooks/useAdmin';
import { AdminBlog } from '@/lib/api/services/admin';
import { toast } from 'sonner';

export default function AdminBlogManagePage() {
  const {
    blogs,
    loading,
    error,
    pagination,
    fetchBlogs,
    toggleBlogStatus,
    deleteBlog,
    search,
    searchTerm,
  } = useAdminBlogs();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedBlogId, setCopiedBlogId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchTerm);
  };

  const handleToggleBlogStatus = async (blogId: string) => {
    setActionLoading(blogId);
    await toggleBlogStatus(blogId);
    setActionLoading(null);
  };

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(`Are you sure you want to delete blog "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(blogId);
    await deleteBlog(blogId);
    setActionLoading(null);
  };

  const copyBlogId = async (blogId: string) => {
    try {
      await navigator.clipboard.writeText(blogId);
      setCopiedBlogId(blogId);
      toast.success('Blog ID copied to clipboard!');
      
      setTimeout(() => {
        setCopiedBlogId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy blog ID');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Blog Management</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} blogs
        </div>
      </div>

      {/* Search and Create */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search blogs by title..."
                  value={searchTerm}
                  onChange={(e) => search(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs found.'}
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white border-0 shadow-lg">
              {/* Cover Image */}
              <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
              {blog.cover_image ? (
                <img 
                  src={blog.cover_image} 
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 w-full h-full flex items-center justify-center">
                <FileText className="h-16 w-16 text-white opacity-60 drop-shadow-lg" />
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge 
                variant={getStatusColor(blog.status)}
                className="bg-white/90 backdrop-blur-sm text-gray-800 border-0 shadow-md font-medium"
                >
                {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </Badge>
              </div>

              {/* Featured Badge */}
              {blog.is_featured && (
                <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
                </div>
              )}

              {/* Copy ID Button */}
              <div className="absolute bottom-3 right-3 z-10">
                <Button
                variant="secondary"
                size="sm"
                onClick={() => copyBlogId(blog.id)}
                className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-0 shadow-md"
                title="Copy Blog ID"
                >
                {copiedBlogId === blog.id ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-600" />
                )}
                </Button>
              </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                <h3 className="font-bold text-lg line-clamp-2 text-gray-800 mb-2 leading-tight">{blog.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {blog.category}
                  </Badge>
                </div>
                </div>

                {blog.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                )}

                {/* Author and Date */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 ring-2 ring-blue-100">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                    {blog.author_name ? blog.author_name.slice(0, 2).toUpperCase() : 'AU'}
                  </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 font-medium truncate">
                  {blog.author_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                </div>
              </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleBlogStatus(blog.id)}
                disabled={actionLoading === blog.id}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-9"
                >
                {actionLoading === blog.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : blog.status === 'published' ? (
                  <>
                  <Eye className="h-4 w-4 mr-1" />
                  Published
                  </>
                ) : (
                  <>
                  <Eye className="h-4 w-4 mr-1" />
                  Publish
                  </>
                )}
                </Button>
                
                <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteBlog(blog.id, blog.title)}
                disabled={actionLoading === blog.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 h-9 w-9 p-0"
                >
                {actionLoading === blog.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                </Button>
              </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchBlogs(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchBlogs(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
