'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  sizes?: string;
  onLoad?: () => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover',
  sizes,
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ width, height }}>
      {(!isInView || !isLoaded) && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: '100%', height: '100%' }}
        />
      )}
      
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={!width && !height}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${
            objectFit === 'cover' ? 'object-cover' : 
            objectFit === 'contain' ? 'object-contain' : 
            objectFit === 'fill' ? 'object-fill' : ''
          }`}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes}
          quality={85}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
}
