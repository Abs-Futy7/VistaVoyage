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
  Quote
} from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About VistaVoyage
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Your gateway to extraordinary adventures. Meet the developers who created this platform.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Our Mission */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At VistaVoyage, we make extraordinary travel experiences accessible to everyone through 
              innovative technology and seamless booking experiences.
            </p>
          </div>
        </div>

        {/* Development Team - Side by Side */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Development Team</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Developer 1 - Frontend */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative mb-6">
                    <Image
                      src="/images/abs.jpg"
                      alt="Alex Rodriguez - Frontend Developer"
                      width={120}
                      height={120}
                      className="rounded-full object-cover shadow-lg mx-auto"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 left-1/2 transform translate-x-8">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Abu Bakar Siddique</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Frontend Developer
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Globe className="h-3 w-3 mr-1" />
                      React & Next.js
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Specialized in creating beautiful, responsive user interfaces using React, Next.js, and TypeScript. 
                    Designed the entire frontend experience of VistaVoyage.
                  </p>
                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span>bojackabs@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      <span>+8801319926696</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Developer 2 - Full Stack */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative mb-6">
                    <Image
                      src="/images/mehedi.jpg"
                      alt="Sarah Chen - Full Stack Developer"
                      width={120}
                      height={120}
                      className="rounded-full object-cover shadow-lg mx-auto"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 left-1/2 transform translate-x-8">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">H.M. Mehedi Hasan</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Full Stack Developer
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Globe className="h-3 w-3 mr-1" />
                      Python & FastAPI
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Expert in backend development with Python, FastAPI, and database architecture. 
                    Built the entire backend infrastructure that powers VistaVoyage.
                  </p>
                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span>hasanmehedi26696@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      <span>+8801540201438</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
