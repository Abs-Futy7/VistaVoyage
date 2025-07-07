import { apiClient } from './client';
import { API_CONFIG } from './config';
import { ApiResponse } from './types';

// Types for blog data from backend
export interface BackendBlog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  category: string;
  tags?: string[];
  cover_image?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

// Types for BlogCard component
export interface Blog {
  title: string;
  excerpt: string;
  author: string;
  date: string | Date;
  imageUrl: string;
  imageHint?: string;
  slug: string;
  category?: string;
}

export interface BlogListResponse {
  blogs: BackendBlog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BlogCreateData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  cover_image?: File;
}

export interface BlogUpdateData {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  cover_image?: File;
}

export interface BlogSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}

// Blog API service
export const blogService = {
  // Convert backend blog to BlogCard format
  convertBlogFormat: (backendBlog: BackendBlog): Blog => ({
    title: backendBlog.title,
    excerpt: backendBlog.excerpt || backendBlog.content.substring(0, 150) + "...",
    author: "Travel Writer", // You can enhance this later with actual author data
    date: backendBlog.published_at || backendBlog.created_at,
    imageUrl: backendBlog.cover_image || "/images/blog.jpg",
    imageHint: `${backendBlog.category} travel blog`,
    slug: backendBlog.id, // Using ID as slug for now
    category: backendBlog.category
  }),

  // Get public blogs (published only)
  async getPublicBlogs(params: BlogSearchParams = {}): Promise<ApiResponse<BlogListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.tag) searchParams.append('tag', params.tag);

    const endpoint = `${API_CONFIG.ENDPOINTS.USER_API.BLOGS.BASE}?${searchParams.toString()}`;
    return apiClient.get<BlogListResponse>(endpoint);
  },

  // Get single blog by ID (public)
  async getBlogById(id: string): Promise<ApiResponse<BackendBlog>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.BY_ID(id);
    return apiClient.get<BackendBlog>(endpoint);
  },

  // Get featured blogs
  async getFeaturedBlogs(limit: number = 6): Promise<ApiResponse<BlogListResponse>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.USER_API.BLOGS.FEATURED}?limit=${limit}`;
    return apiClient.get<BlogListResponse>(endpoint);
  },

  // Get recent blogs
  async getRecentBlogs(limit: number = 5): Promise<ApiResponse<BlogListResponse>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.USER_API.BLOGS.RECENT}?limit=${limit}`;
    return apiClient.get<BlogListResponse>(endpoint);
  },

  // Get blog categories
  async getBlogCategories(): Promise<ApiResponse<string[]>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.CATEGORIES;
    return apiClient.get<string[]>(endpoint);
  },

  // User blog management (authenticated routes)
  
  // Get user's own blogs
  async getMyBlogs(params: BlogSearchParams = {}): Promise<ApiResponse<BlogListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);

    const endpoint = `${API_CONFIG.ENDPOINTS.USER_API.BLOGS.MY_BLOGS}?${searchParams.toString()}`;
    return apiClient.get<BlogListResponse>(endpoint);
  },

  // Get user's own blog by ID
  async getMyBlogById(id: string): Promise<ApiResponse<BackendBlog>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.MY_BLOG_BY_ID(id);
    return apiClient.get<BackendBlog>(endpoint);
  },

  // Create new blog
  async createBlog(data: BlogCreateData): Promise<ApiResponse<BackendBlog>> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    formData.append('category', data.category);
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', data.tags.join(','));
    }
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image);
    }

    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.CREATE;
    return apiClient.postFormData<BackendBlog>(endpoint, formData);
  },

  // Update blog
  async updateBlog(id: string, data: BlogUpdateData): Promise<ApiResponse<BackendBlog>> {
    const formData = new FormData();
    
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.excerpt !== undefined) formData.append('excerpt', data.excerpt);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.tags !== undefined) {
      formData.append('tags', data.tags.join(','));
    }
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image);
    }

    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.UPDATE(id);
    return apiClient.putFormData<BackendBlog>(endpoint, formData);
  },

  // Delete blog
  async deleteBlog(id: string): Promise<ApiResponse<{ message: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.DELETE(id);
    return apiClient.delete<{ message: string }>(endpoint);
  },

  // Toggle publish status
  async togglePublishStatus(id: string): Promise<ApiResponse<{ message: string; is_published: boolean }>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_API.BLOGS.TOGGLE_PUBLISH(id);
    return apiClient.patch<{ message: string; is_published: boolean }>(endpoint);
  },

  // Utility methods
  
  // Calculate reading time (average 200 words per minute)
  calculateReadingTime: (content: string): number => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  },

  // Format blog content for display
  formatBlogContent: (content: string): string => {
    // Simple content formatting - you can enhance this with a markdown parser
    return content
      .split('\n\n') // Split by paragraphs
      .map(paragraph => {
        if (paragraph.trim().startsWith('#')) {
          // Handle headers
          const level = paragraph.match(/^#+/)?.[0].length || 1;
          const text = paragraph.replace(/^#+\s*/, '');
          return `<h${Math.min(level + 1, 6)}>${text}</h${Math.min(level + 1, 6)}>`;
        } else if (paragraph.trim()) {
          // Regular paragraphs
          return `<p>${paragraph.trim()}</p>`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  },

  // Get blog excerpt
  generateExcerpt: (content: string, maxLength: number = 150): string => {
    const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  }
};
