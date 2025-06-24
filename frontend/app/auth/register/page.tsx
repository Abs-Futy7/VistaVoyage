"use client";
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaGoogle, FaFacebook } from "react-icons/fa";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Add a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (password !== confirmPassword) {
        toast.error("Registration Failed", { description: "Passwords do not match." });
        return;
      }
      
      // Mock registration logic
      console.log("Registering:", { name, email, password });
      localStorage.setItem('isAuthenticated', 'true'); // Auto-login after registration
      toast.success("Registration Successful", { description: "Welcome to VoyageVista!" });
      router.push('/');
      window.dispatchEvent(new Event("storage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#2e9eaf]/50 h-screen lg:h-auto items-center justify-center">
      <div>
        <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-center">
          {/* Left side image - matching login page */}
          <div>
            <Image
              src="/images/login-sidebar.jpg"
              alt="Travel destination"
              priority
              className="object-cover h-screen w-full justify-items-start hidden lg:block"
              width={500}
              height={500}
            />
          </div>

          {/* Right side registration form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-gradient-to-b from-white to-blue-100/50 rounded-lg shadow-[#2e9eaf]/50 shadow-lg p-6 border-1 border-black/20">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-center mb-1">
                Create an Account
              </CardTitle>
              
              <CardDescription className="text-center mb-6 text-lg">
                Join VoyageVista to discover amazing travel deals.
              </CardDescription>

              <CardContent className="px-0 py-0">
                <form onSubmit={handleRegister} className="space-y-4">
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
                        value={name} 
                        onChange={e => setName(e.target.value)} 
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
                  
                  <button 
                    type="submit" 
                    className="w-full h-11 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md transition-colors mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                
                
                
              </CardContent>
              
              <CardFooter className="flex justify-center border-t mt-6 pt-6">
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
