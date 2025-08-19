"use client";
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  style,
  priority,
  sizes,
  fallbackSrc = '/images/travel-placeholder.svg', // Default fallback
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError && imageSrc !== fallbackSrc) {
      console.warn(`Failed to load image: ${imageSrc}, falling back to: ${fallbackSrc}`);
      setImageSrc(fallbackSrc);
      setIsError(true);
    }
  };

  const handleLoad = () => {
    setIsError(false);
  };

  // Check if the image URL is from an invalid Supabase domain
  const isInvalidSupabaseUrl = (url: string) => {
    return url.includes('tywqqefmllgseuvdvoia.supabase.co') || 
           (url.includes('.supabase.co') && url.includes('package-images')) ||
           url.includes('example.com'); // Also block example.com URLs
  };

  // Use fallback immediately for known invalid URLs, don't even try to load them
  const shouldUseFallback = isInvalidSupabaseUrl(src);
  const effectiveSrc = shouldUseFallback ? fallbackSrc : imageSrc;

  // Debug logging
  if (shouldUseFallback) {
    console.log(`OptimizedImage: Using fallback for invalid URL: ${src} -> ${fallbackSrc}`);
  }

  if (fill) {
    return (
      <Image
        src={effectiveSrc}
        alt={alt}
        fill
        className={className}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        {...props}
      />
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      sizes={sizes}
      {...props}
    />
  );
}
