import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Edit, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

function AdminBlogManagePage() {
    // Sample data for blogs
const blogs = [
  {
    id: "BLG-001",
    title: "Top 10 Destinations for 2025",
    author: "Maria Garcia",
    date: "15 Jun 2025",
  },
  {
    id: "BLG-002",
    title: "Budget Travel Tips for Europe",
    author: "John Smith",
    date: "10 Jun 2025"

  },
  {
    id: "BLG-003",
    title: "Best Street Food in Asia",
    author: "Sarah Williams",
    date: "05 Jun 2025"
  }
];
  return (
    <div>
     {/* Blogs Tab */}
        <div  className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Blog Management</h2>
              <p className="text-gray-500">Create and manage travel blog content</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search blogs..." className="pl-10 w-64" />
              </div>
              <button className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Blog Post
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <Card key={index} className="border-none shadow-sm overflow-hidden">
                <div className="h-40 bg-gray-100 relative">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                    <h3 className="font-medium">{blog.title}</h3>
                    <p className="text-xs text-gray-200">{blog.date}</p>
                  </div>
                </div>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {blog.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{blog.author}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-3 border-t">
                  <button >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  <div className="flex space-x-2">
                    <button className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div> 
    </div>
  )
}

export default AdminBlogManagePage;
