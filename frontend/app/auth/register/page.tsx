"use client";
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User, MapPin, Globe, Phone, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // No city and country fields as per backend model
  const [phone, setPhone] = useState('');
  const [passport, setPassport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Registration Failed", { description: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone,
        passport
      });
      
      toast.success("Registration Successful", { description: "Welcome to VoyageVista!" });
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Registration failed. Please try again.';
      const errorDetails = apiError.errors?.join(', ') || '';
      
      toast.error("Registration Failed", { 
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#2e9eaf]/50 min-h-screen lg:h-auto flex items-center justify-center py-8 px-4">
      <div className="w-full">
        <div className="flex flex-col xl:flex-row justify-center gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left side image - matching login page */}
          <div className="hidden xl:block flex-shrink-0">
            <Image
              src="/images/login-sidebar.jpg"
              alt="Travel destination"
              priority
              className="object-cover h-[800px] w-[500px] rounded-lg shadow-lg"
              width={500}
              height={800}
            />
          </div>

          {/* Right side registration form */}
          <div className="w-full max-w-4xl mx-auto">
            <Card className="bg-gradient-to-b from-white to-blue-100/50 rounded-lg shadow-[#2e9eaf]/50 shadow-lg p-6 lg:p-8 border-1 border-black/20">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-center mb-2">
                Create an Account
              </CardTitle>
              
              <CardDescription className="text-center mb-8 text-lg">
                Join VoyageVista to discover amazing travel deals.
              </CardDescription>

              <CardContent className="px-0 py-0">
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="John Doe" 
                          required 
                          className="pl-10 h-11 bg-gray-100" 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
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
                  </div>
                  
                  {/* Password Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          className="pl-10 h-11 bg-gray-100" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          className="pl-10 h-11 bg-gray-100" 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* No Location Information Section: city/country removed as per backend model */}
                  
                  {/* Contact & Travel Information Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+1 (555) 123-4567" 
                          required 
                          className="pl-10 h-11 bg-gray-100" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="passport" className="text-sm font-medium">Passport Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          id="passport" 
                          type="text" 
                          placeholder="123456789" 
                          required 
                          className="pl-10 h-11 bg-gray-100" 
                          value={passport} 
                          onChange={e => setPassport(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full h-12 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md transition-colors mt-8"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                
                
                
              </CardContent>
              
              <CardFooter className="flex justify-center border-t mt-8 pt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Log in
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
