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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs found.'}
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 relative">
                {blog.cover_image ? (
                  <img 
                    src={blog.cover_image} 
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={getStatusColor(blog.status)}>
                    {blog.status}
                  </Badge>
                </div>

                {/* Featured Badge */}
                {blog.is_featured && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Copy ID Button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyBlogId(blog.id)}
                    className="h-8 w-8 p-0"
                    title="Copy Blog ID"
                  >
                    {copiedBlogId === blog.id ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{blog.category}</p>
                  </div>

                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3">{blog.excerpt}</p>
                  )}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {blog.author_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{blog.author_id}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
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
                    className="flex-1"
                  >
                    {actionLoading === blog.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : blog.status === 'published' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      'Publish'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBlog(blog.id, blog.title)}
                    disabled={actionLoading === blog.id}
                    className="text-red-600 hover:text-red-700"
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
