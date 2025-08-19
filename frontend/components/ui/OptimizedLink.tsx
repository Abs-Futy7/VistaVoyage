"use client";
import Link from 'next/link';
import { ReactNode } from 'react';

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  prefetch?: boolean;
}

export function OptimizedLink({ 
  href, 
  children, 
  className, 
  onClick,
  prefetch = true 
}: OptimizedLinkProps) {
  return (
    <Link 
      href={href} 
      className={className}
      onClick={onClick}
      prefetch={prefetch}
      // Enable faster navigation with scroll restoration disabled for client-side navigation
      scroll={false}
    >
      {children}
    </Link>
  );
}
