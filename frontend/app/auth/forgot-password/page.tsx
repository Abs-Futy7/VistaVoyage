"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { KeyRound, ArrowLeft, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock password reset logic with delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log("Password reset requested for:", email);
      toast.success("Reset Link Sent", {
        description: "Check your email for password reset instructions."
      });
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-100 h-screen lg:h-auto items-center justify-center">
      <div>
        <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-center">
          {/* Left side image - matching login page */}
          <div>
            <Image
              src="/images/alex-azabache-V83v-MYB_Z8-unsplash.jpg"
              alt="Travel destination"
              priority
              className="object-cover h-screen w-full justify-items-start hidden lg:block"
              width={500}
              height={500}
            />
          </div>

          {/* Right side form - matching login page styling */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-white rounded-lg shadow-green-600/30 shadow-lg p-6 border-1 border-black/20">
              <Link 
                href="/auth/login" 
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
              
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-center mt-2 mb-1">
                Forgot Your Password?
              </CardTitle>
              
              <CardDescription className="text-center mb-6 text-lg">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>

              <CardContent className="px-0 py-0">
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        required 
                        className="pl-10 h-11 bg-gray-100" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full h-11 bg-green-500 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
                <Toaster />
              </CardContent>
              
              <CardFooter className="flex justify-center border-t mt-6 pt-6">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    Log in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage