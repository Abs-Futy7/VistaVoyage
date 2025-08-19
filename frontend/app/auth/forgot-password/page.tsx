"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { KeyRound, ArrowLeft, Mail, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { authService } from '@/lib/api/services/auth'
import { useRouter } from 'next/navigation'

interface ForgotPasswordStep1Props {
  onNext: (email: string) => void;
  isLoading: boolean;
}

interface ForgotPasswordStep2Props {
  email: string;
  onNext: (sessionId: string) => void;
  onBack: () => void;
  isLoading: boolean;
  timeLeft: number;
  onResendOTP: () => void;
}

interface ForgotPasswordStep3Props {
  email: string;
  sessionId: string;
  onSuccess: () => void;
  onBack: () => void;
  isLoading: boolean;
}

// Step 1: Email Input
const ForgotPasswordStep1: React.FC<ForgotPasswordStep1Props> = ({ onNext, isLoading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      await authService.forgotPassword(email);
      toast.success('OTP sent to your email!');
      onNext(email);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  return (
    <>
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <CardTitle className="text-3xl font-bold text-center mt-2 mb-1">
        Forgot Your Password?
      </CardTitle>
      
      <CardDescription className="text-center mb-6 text-lg">
        Enter your email address and we'll send you an OTP to reset your password.
      </CardDescription>

      <CardContent className="px-0 py-0">
        <form className="space-y-5" onSubmit={handleSubmit}>
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
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-green-500 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </CardContent>
    </>
  );
};

// Step 2: OTP Verification
const ForgotPasswordStep2: React.FC<ForgotPasswordStep2Props> = ({ 
  email, onNext, onBack, isLoading, timeLeft, onResendOTP 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      const response = await authService.verifyOTP(email, otpString);
      toast.success('OTP verified successfully!');
      onNext(response.session_id);
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']); // Clear OTP on error
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <CardTitle className="text-3xl font-bold text-center mt-2 mb-1">
        Enter Verification Code
      </CardTitle>
      
      <CardDescription className="text-center mb-6 text-lg">
        We've sent a 6-digit code to <br />
        <span className="font-semibold text-blue-600">{email}</span>
      </CardDescription>

      <CardContent className="px-0 py-0">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-center">Enter 6-digit OTP</label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-bold border-2"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          {timeLeft > 0 ? (
            <p className="text-center text-sm text-gray-600">
              Code expires in <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">OTP expired</p>
              <Button
                type="button"
                variant="outline"
                onClick={onResendOTP}
                className="text-blue-600"
              >
                Resend OTP
              </Button>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-blue-500 hover:bg-blue-700"
            disabled={isLoading || timeLeft === 0}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </CardContent>
    </>
  );
};

// Step 3: New Password
const ForgotPasswordStep3: React.FC<ForgotPasswordStep3Props> = ({ 
  email, sessionId, onSuccess, onBack, isLoading 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await authService.resetPassword(email, newPassword, sessionId);
      toast.success('Password reset successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <KeyRound className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <CardTitle className="text-3xl font-bold text-center mt-2 mb-1">
        Set New Password
      </CardTitle>
      
      <CardDescription className="text-center mb-6 text-lg">
        Create a strong password for your account
      </CardDescription>

      <CardContent className="px-0 py-0">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password" 
                required 
                className="pl-10 pr-10 h-11 bg-gray-100" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password" 
                required 
                className="pl-10 pr-10 h-11 bg-gray-100" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {newPassword && confirmPassword && (
            <div className="text-sm">
              {newPassword === confirmPassword ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Passwords match
                </div>
              ) : (
                <div className="text-red-600">
                  Passwords do not match
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-green-500 hover:bg-green-700"
            disabled={isLoading || newPassword !== confirmPassword}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </>
  );
};

// Success Component
const SuccessComponent = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <CardTitle className="text-3xl font-bold text-center mt-2 mb-1">
        Password Reset Successful!
      </CardTitle>
      
      <CardDescription className="text-center mb-6 text-lg">
        Your password has been successfully reset. You can now login with your new password.
      </CardDescription>

      <CardContent className="px-0 py-0 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Redirecting to login page in 3 seconds...
        </p>
        
        <Button 
          onClick={() => router.push('/auth/login')}
          className="w-full h-11 bg-green-500 hover:bg-green-700"
        >
          Go to Login
        </Button>
      </CardContent>
    </>
  );
};

// Main Component
function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(300); // 5 minutes

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'otp' && otpTimeLeft > 0) {
      interval = setInterval(() => {
        setOtpTimeLeft(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, otpTimeLeft]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setIsLoading(true);
    try {
      setEmail(submittedEmail);
      setStep('otp');
      setOtpTimeLeft(300); // Reset timer
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = (verifiedSessionId: string) => {
    setSessionId(verifiedSessionId);
    setStep('password');
  };

  const handlePasswordReset = () => {
    setStep('success');
  };

  const handleResendOTP = async () => {
    try {
      await authService.forgotPassword(email);
      setOtpTimeLeft(300); // Reset timer
      toast.success('New OTP sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  const handleBackFromOtp = () => {
    setStep('email');
    setOtpTimeLeft(300);
  };

  const handleBackFromPassword = () => {
    setStep('otp');
  };

  return (
    <div className="bg-green-100 min-h-screen lg:h-auto flex items-center justify-center py-8">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-center">
          {/* Left side image */}
          <div className="hidden lg:block">
            <Image
              src="/images/alex-azabache-V83v-MYB_Z8-unsplash.jpg"
              alt="Travel destination"
              priority
              className="object-cover h-screen w-full justify-items-start"
              width={500}
              height={500}
            />
          </div>

          {/* Right side form */}
          <div className="w-full max-w-md mx-auto px-4">
            <Card className="bg-white rounded-lg shadow-green-600/30 shadow-lg p-6 border-1 border-black/20">
              {step === 'email' && (
                <Link 
                  href="/auth/login" 
                  className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Link>
              )}
              
              {step === 'email' && (
                <ForgotPasswordStep1 
                  onNext={handleEmailSubmit}
                  isLoading={isLoading}
                />
              )}

              {step === 'otp' && (
                <ForgotPasswordStep2
                  email={email}
                  onNext={handleOtpVerified}
                  onBack={handleBackFromOtp}
                  isLoading={isLoading}
                  timeLeft={otpTimeLeft}
                  onResendOTP={handleResendOTP}
                />
              )}

              {step === 'password' && (
                <ForgotPasswordStep3
                  email={email}
                  sessionId={sessionId}
                  onSuccess={handlePasswordReset}
                  onBack={handleBackFromPassword}
                  isLoading={isLoading}
                />
              )}

              {step === 'success' && <SuccessComponent />}

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
      <Toaster />
    </div>
  )
}

export default ForgotPasswordPage