
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
      {isLoading ? (
        // Placeholder for the logo area itself, matching the dimensions of the image container
        <div className="h-[32px] w-[160px] bg-muted/20 animate-pulse rounded-sm"></div>
      ) : useFallbackLogo ? (
        <>
          <Layers3 size={28} />
          <span className="text-2xl font-headline font-semibold">Reactiverse</span>
        </>
      ) : (
        // Explicit container for the image with defined dimensions
        <div style={{ width: '160px', height: '32px', position: 'relative' }}>
          <Image
            src="/site_logo.png"
            alt="Reactiverse Logo"
            layout="fill"         // Image will fill this div
            objectFit="contain"  // Equivalent to className="object-contain" for layout="fill"
            priority
            data-ai-hint="site logo"
            onError={() => {
              setUseFallbackLogo(true);
            }}
          />
        </div>
      )}
    </Link>
  );
};

export default Logo;
