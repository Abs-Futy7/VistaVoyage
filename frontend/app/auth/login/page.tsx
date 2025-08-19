"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LogIn, Mail, Lock, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  // Get return URL from query params
  const returnUrl = searchParams.get('return') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      toast.success("Login Successful", {
        description: "Welcome back to VoyageVista!",
        icon: <Check className="h-4 w-4" />,
      });
      
      // Redirect to return URL or homepage
      router.push(returnUrl);
    } catch (error: any) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      
      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-100 h-screen lg:h-auto items-center justify-center">
      <div>
        <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-center">
          {/* Left side image - keeping your existing implementation */}
          <div>
            <Image
              src="/images/signup-sidebar.jpg"
              alt="Travel destination"
              priority
              className="object-cover h-screen w-full justify-items-start hidden lg:block"
              width={500}
              height={500}
            />
          </div>

          {/* Right side login form - fixing the structure */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-gradient-to-b from-white to-blue-100/50 rounded-lg shadow-blue-600/30 shadow-lg p-6 border-1 border-black/20">
              
              <CardTitle className="text-4xl font-bold text-center mt-3 mb-1">
                Welcome Back!
              </CardTitle>
              
              <CardDescription className="text-center mb-6 text-lg">
                Log in to your VoyageVista account
              </CardDescription>

              <CardContent className="px-0 py-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="pl-10 h-11 bg-gray-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-10 h-11 bg-gray-100"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  
                  <button
                    type="submit"
                    className="w-full h-11 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md transition-colors mt-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </form>

                

                <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-center block mt-4"
                      >
                        Forgot password?
                      </Link>
              </CardContent>

              <CardFooter className="flex justify-center border-t mt-6 pt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
