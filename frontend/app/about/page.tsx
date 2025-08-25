"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Briefcase,
  Globe,
  Star,
  Quote,
  Github,
  Linkedin
} from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-tl from-blue-500 to-indigo-600 py-10 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-8xl text-white mb-6 font-[Bebas_Neue]">About Vista<span className="text-yellow-300">Voyage</span></h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Get support 24/7, with our award-winning support network of growth experts.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Our Mission */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Excellence in travel technology</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We deliver cutting-edge solutions that transform how travelers discover and book their perfect adventures, 
              backed by innovative technology and seamless user experiences.
            </p>
          </div>
        </div>

        {/* Development Team - Side by Side */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our <span className="text-blue-500 tracking-tight">Development </span>Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Developer 1 - Frontend */}
            <div className="bg-white rounded-3xl shadow-lg border-2 overflow-hidden max-w-sm mx-auto border-blue-300 transition-colors duration-300">
              {/* Image with Gradient Overlay */}
              <div className="relative h-96 group">
                <Image
                  src="/images/abs.jpg"
                  alt="Abu Bakar Siddique - Frontend Developer"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
                {/* Blue Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-800 via-blue-900/50 to-transparent"></div>
                
                {/* Name and Role on Image */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold text-center">Abu Bakar Siddique</h3>
                  <p className="text-lg font-regular opacity-90 text-center">Frontend Developer</p>
                </div>
              </div>

              {/* Additional Details Below */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                    Specialized in creating beautiful, responsive user interfaces using React, Next.js, and TypeScript. 
                    Designed the entire frontend experience of VistaVoyage.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-300">
                      React
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border border-purple-300">
                      Next.js
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300">
                      TypeScript
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    
                    
                    <div className="flex justify-start space-x-3 pt-2">
                      <a
                      href="https://github.com/Abs-Futy7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-600 hover:border-gray-600 hover:text-gray-800 transition-all"
                      >
                      <Github className="h-5 w-5" />
                      </a>
                      <a
                      href="https://linkedin.com/in/abu-bakar-siddique"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 border-2 border-blue-400 rounded-full flex items-center justify-center text-blue-600 hover:border-blue-600 hover:text-blue-800 transition-all"
                      >
                      <Linkedin className="h-5 w-5" />
                      </a>
                      <a
                      href="mailto:bojackabs@gmail.com"
                      className="w-10 h-10 border-2 border-red-400 rounded-full flex items-center justify-center text-red-600 hover:border-red-600 hover:text-red-800 transition-all"
                      >
                      <Mail className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer 2 - Full Stack */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto border-2 border-blue-300">
              {/* Image with Gradient Overlay */}
              <div className="relative h-96 group">
                <Image
                  src="/images/mehedi.jpg"
                  alt="H.M. Mehedi Hasan - Full Stack Developer"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
                {/* Blue Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-800 via-blue-900/50 to-transparent"></div>
                
                {/* Name and Role on Image */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold text-center">H.M. Mehedi Hasan</h3>
                  <p className="text-lg font-regular opacity-90 text-center">Full Stack Developer</p>
                </div>
              </div>

              {/* Additional Details Below */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                    Expert in backend development with Python, FastAPI, and database architecture. 
                    Built the entire backend infrastructure that powers VistaVoyage.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border border-orange-300">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border border-red-300">
                      FastAPI
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-300">
                      PostgreSQL
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    
                   

                    <div className="flex justify-start space-x-3 pt-2">
                      <a href="https://github.com/mehedi26696" target="_blank" rel="noopener noreferrer" 
                         className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-600 hover:border-gray-600 hover:text-gray-800 transition-all">
                        <Github className="h-5 w-5" />
                      </a>
                      <a href="https://linkedin.com/in/mehedi-hasan" target="_blank" rel="noopener noreferrer" 
                         className="w-10 h-10 border-2 border-blue-400 rounded-full flex items-center justify-center text-blue-600 hover:border-blue-600 hover:text-blue-800 transition-all">
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a href="mailto:hasanmehedi26696@gmail.com" 
                         className="w-10 h-10 border-2 border-red-400 rounded-full flex items-center justify-center text-red-600 hover:border-red-600 hover:text-red-800 transition-all">
                        <Mail className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
