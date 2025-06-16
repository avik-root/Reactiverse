
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // To prevent flash of fallback during initial check

  useEffect(() => {
    // Check if custom logo exists. This effect runs only on client.
    const img = new window.Image();
    img.src = "/site_logo.png";
    img.onload = () => {
      setUseFallbackLogo(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      setUseFallbackLogo(true);
      setIsLoading(false);
    };
  }, []);

  if (isLoading) {
    // Render a placeholder or nothing to avoid layout shift / hydration issues
    return (
      <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors h-[32px] w-[160px]">
        {/* Placeholder can be a simple div matching dimensions or a skeleton */}
      </div>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
      {useFallbackLogo ? (
        <>
          <Layers3 size={28} />
          <span className="text-2xl font-headline font-semibold">Reactiverse</span>
        </>
      ) : (
        <Image 
          src="/site_logo.png" 
          alt="Reactiverse Logo" 
          width={160} 
          height={32} 
          priority 
          className="object-contain" // Added object-contain
          data-ai-hint="site logo"
          onError={() => {
            setUseFallbackLogo(true);
          }}
        />
      )}
    </Link>
  );
};

export default Logo;

