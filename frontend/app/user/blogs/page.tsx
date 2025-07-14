"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Eye, 
  PlusCircle, 
  Search, 
  Trash2, 
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  Save,
  X,
  Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';
import { blogService, BackendBlog, BlogCreateData, BlogUpdateData } from '@/lib/api/services/blog';

const BLOG_CATEGORIES = [
  'Travel Guide',
  'Budget Travel',
  'Adventure',
  'Culture',
  'Food',
  'Tips',
  'Destination Review',
  'Travel Story'
];

// Blog Form Data type
interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  cover_image: File | null;
}

export default function UserBlogsPage() {
  const [blogs, setBlogs] = useState<BackendBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BackendBlog | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Form data
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    cover_image: null
  });

  // Fetch user's blogs from API
  const fetchUserBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogService.getMyBlogs({
        page,
        limit: 12,
        search: searchTerm,
        category: selectedCategory === 'all' ? undefined : selectedCategory
      });
      
      if (response.success && response.data) {
        const { blogs: fetchedBlogs, total_pages, total } = response.data;
        
        if (page === 1) {
          setBlogs(fetchedBlogs || []);
        } else {
          setBlogs(prev => [...prev, ...(fetchedBlogs || [])]);
        }
        setTotalPages(total_pages || 1);
        setHasMore(page < (total_pages || 1));
      } else {
        throw new Error(response.message || response.errors?.[0] || 'Failed to fetch blogs');
      }
    } catch (error: any) {
      console.error('Error fetching user blogs:', error);
      toast.error('Failed to fetch blogs', { 
        description: error?.message || 'Please try again later' 
      });
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async () => {
    setLoading(true);
    try {
      const blogData: BlogCreateData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category,
        cover_image: formData.cover_image || undefined
      };

      const response = await blogService.createBlog(blogData);
      
      if (response.success) {
        toast.success('Blog created successfully!');
        setIsCreateDialogOpen(false);
        setPage(1);
        fetchUserBlogs();
      } else {
        throw new Error(response.message || response.errors?.[0] || 'Failed to create blog');
      }
    } catch (error: any) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog', {
        description: error?.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (blogId: string) => {
    setLoading(true);
    try {
      const blogData: BlogUpdateData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category,
        cover_image: formData.cover_image || undefined
      };

      const response = await blogService.updateBlog(blogId, blogData);
      
      if (response.success) {
        toast.success('Blog updated successfully!');
        setIsEditDialogOpen(false);
        setPage(1);
        fetchUserBlogs();
      } else {
        throw new Error(response.message || response.errors?.[0] || 'Failed to update blog');
      }
    } catch (error: any) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog', {
        description: error?.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(blogId);
    try {
      const response = await blogService.deleteBlog(blogId);
      
      if (response.success) {
        toast.success('Blog deleted successfully!');
        setPage(1);
        fetchUserBlogs();
      } else {
        throw new Error(response.message || response.errors?.[0] || 'Failed to delete blog');
      }
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog', {
        description: error?.message || 'Please try again later'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublishStatus = async (blogId: string) => {
    setActionLoading(blogId);
    try {
      const response = await blogService.togglePublishStatus(blogId);
      
      if (response.success) {
        toast.success('Blog status updated successfully!');
        fetchUserBlogs();
      } else {
        throw new Error(response.message || response.errors?.[0] || 'Failed to update blog status');
      }
    } catch (error: any) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status', {
        description: error?.message || 'Please try again later'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      cover_image: null
    });
  };

  const handleEditBlog = (blog: BackendBlog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category,
      cover_image: null
    });
    setIsEditDialogOpen(true);
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

  const filteredBlogs = blogs;

  // Load blogs and search/filter effects
  useEffect(() => {
    if (page > 1) {
      fetchUserBlogs();
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    // Reset page to 1 and fetch blogs when search term or category changes
    const timeoutId = setTimeout(() => {
      fetchUserBlogs();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  // Initial load
  useEffect(() => {
    fetchUserBlogs();
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Blogs</h1>
        </div>
        <div className="text-sm text-gray-600">
          Total: {blogs.length} blogs
        </div>
      </div>

      {/* Search and Create */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search my blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BLOG_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open) {
                // Reset form when opening create dialog
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Blog
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                </DialogHeader>
                <BlogForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={createBlog}
                  loading={loading}
                  submitText="Create Blog"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && blogs.length === 0 ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600">Loading your blogs...</p>
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' ? 'No blogs found matching your filters.' : 'You haven\'t created any blogs yet.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button 
                className="mt-4" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Blog
              </Button>
            )}
          </div>
        ) : (
          filteredBlogs.map((blog) => (
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

                  {/* Tags removed */}

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {formatDate(blog.created_at)}</span>
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/blogs/${blog.id}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBlog(blog)}
                    disabled={actionLoading === blog.id}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublishStatus(blog.id)}
                    disabled={actionLoading === blog.id}
                    className="flex-1"
                  >
                    {actionLoading === blog.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : blog.status === 'published' ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBlog(blog.id, blog.title)}
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

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <Button 
            onClick={loadMore}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Blogs'
            )}
          </Button>
        </div>
      )}

      {/* Edit Blog Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          // Reset form and editing state when closing edit dialog
          setEditingBlog(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          {editingBlog && (
            <BlogForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={() => updateBlog(editingBlog.id)}
              loading={loading}
              submitText="Update Blog"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Blog Form Component
interface BlogFormProps {
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function BlogForm({ formData, setFormData, onSubmit, loading, submitText }: BlogFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter blog title"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {BLOG_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief description of your blog post"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your blog content here..."
          rows={10}
          required
        />
      </div>

      {/* Tags input removed */}

      <div>
        <Label htmlFor="cover_image">Cover Image</Label>
        <Input
          id="cover_image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {submitText === 'Create Blog' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
