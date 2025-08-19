"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Scale, 
  CreditCard, 
  Ban, 
  AlertTriangle, 
  Users, 
  Calendar,
  Gavel
} from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Scale className="h-16 w-16 text-blue-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Please read these terms and conditions carefully before using our services.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Last Updated */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Last Updated: August 20, 2025</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Agreement */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using VistaVoyage ("we," "our," or "us"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Gavel className="h-6 w-6 mr-3 text-green-600" />
                Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Permission is granted to temporarily download one copy of the materials on VistaVoyage's website 
                for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on VistaVoyage's website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
              <p className="text-gray-700">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated 
                by VistaVoyage at any time. Upon terminating your viewing of these materials or upon the termination of this license, 
                you must destroy any downloaded materials in your possession whether in electronic or printed format.
              </p>
            </CardContent>
          </Card>

          {/* Booking Terms */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
                Booking and Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Booking Confirmation</h3>
                <p className="text-gray-700">
                  All bookings are subject to availability and confirmation. We reserve the right to decline any booking 
                  at our discretion. Booking confirmation will be sent via email.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Payment</h3>
                <p className="text-gray-700 mb-2">
                  Full payment is required at the time of booking unless otherwise specified. We accept:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Credit and debit cards</li>
                  <li>Bank transfers</li>
                  <li>Digital payment methods</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Pricing</h3>
                <p className="text-gray-700">
                  All prices are displayed in Bangladeshi Taka (TK) and include applicable taxes unless otherwise stated. 
                  Prices are subject to change without notice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Ban className="h-6 w-6 mr-3 text-red-600" />
                Cancellation and Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Cancellation by Customer</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• 30+ days before travel: Full refund minus processing fee</li>
                    <li>• 15-29 days before travel: 50% refund</li>
                    <li>• 7-14 days before travel: 25% refund</li>
                    <li>• Less than 7 days: No refund</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Cancellation by VistaVoyage</h4>
                  <p className="text-orange-700 text-sm">
                    In the rare event we must cancel your trip due to circumstances beyond our control, 
                    we will provide a full refund or offer alternative arrangements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="h-6 w-6 mr-3 text-indigo-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                As a user of our services, you agree to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect other travelers and local customs</li>
                </ul>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Carry valid travel documents</li>
                  <li>Arrive on time for scheduled activities</li>
                  <li>Follow safety guidelines and instructions</li>
                  <li>Report any issues promptly to our team</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="h-6 w-6 mr-3 text-orange-600" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  VistaVoyage acts as an intermediary between you and various service providers (hotels, airlines, tour operators, etc.). 
                  Our liability is limited to the services we directly provide.
                </p>
                
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                  <p className="text-yellow-700 text-sm">
                    We are not liable for any delays, cancellations, overbooking, strikes, weather conditions, 
                    or other circumstances beyond our control. We strongly recommend purchasing travel insurance.
                  </p>
                </div>

                <p className="text-gray-700">
                  In no event shall VistaVoyage be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="h-6 w-6 mr-3 text-purple-600" />
                Modifications to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                VistaVoyage reserves the right to revise these terms of service at any time without notice. 
                By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Notification:</strong> We will notify users of significant changes to these terms 
                  by posting a notice on our website and updating the "Last Updated" date.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@vistavoyage.com</p>
                <p><strong>Phone:</strong> +880-123-456-789</p>
                <p><strong>Address:</strong> Dhaka, Bangladesh</p>
              </div>
              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Governing Law:</strong> These terms and conditions are governed by and construed 
                  in accordance with the laws of Bangladesh and you irrevocably submit to the exclusive 
                  jurisdiction of the courts in that state or location.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
