
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(true); // Default to true until checked
  const [isLoading, setIsLoading] = useState(true);
  const [logoVersionKey, setLogoVersionKey] = useState(Date.now()); // Key to force re-render of Image

  const checkLogoExistence = () => {
    setIsLoading(true);
    const customLogoPath = "/site_logo.png";
    // Use a unique query param for each check to bypass browser cache for the check itself
    const checkSrc = `${customLogoPath}?check=${new Date().getTime()}`;

    const img = new window.Image();
    img.src = checkSrc;
    img.onload = () => {
      setUseFallbackLogo(false); // Custom logo exists
      setLogoVersionKey(Date.now()); // Update key to ensure next/image re-evaluates
      setIsLoading(false);
    };
    img.onerror = () => {
      setUseFallbackLogo(true); // Custom logo does not exist or error
      setIsLoading(false);
    };
  };

  useEffect(() => {
    checkLogoExistence(); // Initial check on mount

    const handleLogoUpdatedEvent = () => {
      // When 'logoUpdated' event is dispatched, re-check the logo existence
      // and update the key to force next/image to refresh.
      checkLogoExistence();
    };

    window.addEventListener('logoUpdated', handleLogoUpdatedEvent);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdatedEvent);
    };
  }, []); // Empty dependency array: runs once on mount to set up listener and initial check.

  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
      {isLoading ? (
        <>
          <div style={{ width: '32px', height: '32px' }} className="bg-muted/30 animate-pulse rounded-md shrink-0"></div>
          <div style={{ width: '120px', height: '24px' }} className="bg-muted/30 animate-pulse rounded-md"></div>
        </>
      ) : (
        <>
          <div style={{ width: '32px', height: '32px', position: 'relative', flexShrink: 0 }}>
            {useFallbackLogo ? (
              <Layers3 size={28} className="text-primary w-full h-full" />
            ) : (
              <Image
                src="/site_logo.png" // Base path, next/image handles optimization and caching
                key={logoVersionKey}  // Changing key forces re-evaluation by next/image
                alt="Reactiverse Site Logo"
                layout="fill"
                objectFit="contain" // Ensures aspect ratio is maintained within the 32x32 box
                priority // If it's critical for LCP
                data-ai-hint="site logo icon"
                onError={() => {
                  // This internal onError for next/image can also set fallback if needed,
                  // though the primary check should handle most cases.
                  setUseFallbackLogo(true);
                }}
              />
            )}
          </div>
          <span className="text-2xl font-headline font-semibold">Reactiverse</span>
        </>
      )}
    </Link>
  );
};

export default Logo;
