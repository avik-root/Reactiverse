
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [logoVersionKey, setLogoVersionKey] = useState(Date.now().toString()); // Ensure it's a string

  const checkLogoExistence = () => {
    setIsLoading(true);
    const customLogoPath = "/site_logo.png";
    const checkSrc = `${customLogoPath}?check=${Date.now()}`;

    const img = new window.Image();
    img.src = checkSrc;
    img.onload = () => {
      setUseFallbackLogo(false);
      setLogoVersionKey(Date.now().toString()); // Update key to force re-render
      setIsLoading(false);
    };
    img.onerror = () => {
      setUseFallbackLogo(true);
      setIsLoading(false);
    };
  };

  useEffect(() => {
    checkLogoExistence();

    const handleLogoUpdatedEvent = () => {
      checkLogoExistence(); // This will update logoVersionKey if the logo exists
    };

    window.addEventListener('logoUpdated', handleLogoUpdatedEvent);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdatedEvent);
    };
  }, []);

  const logoSrc = useFallbackLogo ? '' : `/site_logo.png?v=${logoVersionKey}`;

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
            {useFallbackLogo || !logoSrc ? (
              <Layers3 size={28} className="text-primary w-full h-full" />
            ) : (
              <Image
                src={logoSrc}
                key={logoVersionKey}
                alt="Reactiverse Site Logo"
                layout="fill"
                objectFit="contain"
                priority
                data-ai-hint="site logo icon"
                onError={() => {
                  setUseFallbackLogo(true); // Fallback if even the versioned src fails
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
