import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BiUserCircle } from 'react-icons/bi'
import { BsArrowRight } from 'react-icons/bs'
import { FaCalendarDays } from 'react-icons/fa6'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'

interface Blog {
  title: string;
  excerpt: string;
  author: string;
  date: string | Date;
  imageUrl: string;
  imageHint?: string;
  slug: string;
  category?: string;
}

function BlogCard({ blog }: { blog: Blog }) {
  const { title, excerpt, author, date, imageUrl, imageHint, slug, category = "Travel" } = blog;
  
  return (
    <div className="bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-xl flex flex-col h-full border border-gray-100 transform hover:-translate-y-1">
      {/* Image container with category badge */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent z-10"></div>
        <Image
          src={imageUrl}
          alt={title}
          width={600}
          height={350}
          className="w-full h-52 object-cover transition-transform duration-700 hover:scale-110"
          data-ai-hint={imageHint || 'blog article'}
        />
        <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-xl z-20 shadow-xl">
          {category}
        </span>
      </div>
      
      {/* Content section */}
      <div className="p-5 flex-grow">
        <h3 className="text-3xl font-bold text-blue-900 mb-3 leading-tight line-clamp-2 font-[Inter] tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {excerpt}
        </p>
        
        {/* Author and date info */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <BiUserCircle className="h-5 w-5 text-blue-600" />
            </div>
            <span>{author}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarDays className="h-3 w-3 mr-1.5 text-blue-600" />
            <span>{new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
        </div>
      </div>
      
      {/* Footer with read more link */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <Link 
          href={`/blogs/${slug}`} 
          className="group flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Read Full Article 
          <BsArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}

export default BlogCard

