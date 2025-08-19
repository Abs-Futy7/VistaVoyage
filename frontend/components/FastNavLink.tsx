"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FastNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function FastNavLink({ href, children, className, prefetch = true }: FastNavLinkProps) {
  const router = useRouter();
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (prefetch && !isPreloaded) {
      router.prefetch(href);
      setIsPreloaded(true);
    }
  }, [href, prefetch, isPreloaded, router]);

  const handleMouseEnter = () => {
    if (!isPreloaded) {
      router.prefetch(href);
      setIsPreloaded(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Show immediate loading state
    const startTime = Date.now();
    
    // Navigate
    router.push(href);
    
    // Track navigation time
    const navigationTime = Date.now() - startTime;
    console.log(`🚀 Navigation to ${href}: ${navigationTime}ms`);
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}
