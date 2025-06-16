
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs only client-side
    if (typeof window === 'undefined') return;

    const img = new window.Image();
    img.src = "/site_logo.png"; // Path to the custom logo
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
        <>
          <div style={{ width: '32px', height: '32px' }} className="bg-muted/30 animate-pulse rounded-md shrink-0"></div>
          <div style={{ width: '120px', height: '24px' }} className="bg-muted/30 animate-pulse rounded-md"></div>
        </>
      ) : (
        <>
          {useFallbackLogo ? (
            <Layers3 size={28} className="shrink-0" />
          ) : (
            <div style={{ height: '32px', width: '32px', position: 'relative', flexShrink: 0 }}>
              <Image
                src="/site_logo.png"
                alt="Reactiverse Site Logo"
                layout="fill"
                objectFit="contain"
                priority
                data-ai-hint="site logo icon"
                onError={() => {
                  setUseFallbackLogo(true);
                }}
              />
            </div>
          )}
          <span className="text-2xl font-headline font-semibold">Reactiverse</span>
        </>
      )}
    </Link>
  );
};

export default Logo;
