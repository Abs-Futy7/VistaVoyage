"use client";
import React from 'react';
import { Shield, Eye, Users, Lock, Mail, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <Shield className="h-16 w-16 text-blue-200 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your privacy matters. Here's how we protect your information.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Last Updated */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">Last Updated: August 20, 2025</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* What We Collect */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold">What We Collect</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">When You Use Our Service:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name, email, and phone number when you register</li>
                  <li>Payment information for bookings</li>
                  <li>Travel preferences and booking history</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automatically:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Pages you visit on our website</li>
                  <li>Device and location data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use It */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Process your bookings and payments</li>
              <li>Send you booking confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send promotional emails (only if you agree)</li>
              <li>Keep our platform secure</li>
            </ul>
          </div>

          {/* Sharing Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold">Sharing Your Information</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We <strong>never sell</strong> your personal information. We only share it when:
            </p>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <strong className="text-blue-800">Service Providers:</strong>
                <span className="text-blue-700"> Payment processors, hotels, and airlines to complete your bookings</span>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <strong className="text-green-800">Legal Requirements:</strong>
                <span className="text-green-700"> When required by law or to protect our users</span>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold">Your Rights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Access & Update</h4>
                <p className="text-gray-700 text-sm">View and update your information in your account settings</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Delete</h4>
                <p className="text-gray-700 text-sm">Request deletion of your personal information</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Download</h4>
                <p className="text-gray-700 text-sm">Get a copy of your data in a readable format</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Unsubscribe</h4>
                <p className="text-gray-700 text-sm">Opt out of marketing emails anytime</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">How We Protect Your Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>SSL encryption</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Regular security audits</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Limited access controls</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold">Questions?</h2>
            </div>
            <p className="text-gray-700 mb-4">Contact us about your privacy:</p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@vistavoyage.com</p>
              <p><strong>Phone:</strong> +880-123-456-789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
