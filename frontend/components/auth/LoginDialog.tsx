"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  redirectTo?: string;
}

export function LoginDialog({ 
  isOpen, 
  onClose, 
  message = "You need to login to access this feature",
  redirectTo = "/auth/login"
}: LoginDialogProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = () => {
    setIsRedirecting(true);
    onClose();
    router.push(redirectTo);
  };

  const handleCancel = () => {
    onClose();
    router.back(); // Go back to previous page
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Login Required
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-gray-600">
            Please login to your account to continue accessing this protected content.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isRedirecting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleLogin}
            disabled={isRedirecting}
          >
            {isRedirecting ? 'Redirecting...' : 'Login'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
