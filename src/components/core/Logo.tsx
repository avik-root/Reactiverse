
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layers3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Logo = () => {
  const [useFallbackLogo, setUseFallbackLogo] = useState(true); // True if no custom logo exists or current version failed
  const [isLoading, setIsLoading] = useState(true);
  const [logoVersionKey, setLogoVersionKey] = useState(Date.now().toString());
  const [imageError, setImageError] = useState(false); // Tracks if the current version of the logo failed to load

  useEffect(() => {
    // Initial check for logo existence on component mount
    const checkLogoExistence = () => {
      setIsLoading(true);
      setImageError(false); // Reset error state on check
      const customLogoPath = "/site_logo.png";
      // Use a cache-busting query for the existence check itself
      const checkSrc = `${customLogoPath}?check=${Date.now()}`;

      const img = new window.Image();
      img.src = checkSrc;
      img.onload = () => {
        setUseFallbackLogo(false); // Custom logo exists
        // Update version key to ensure the Image component tries to load it with a fresh query
        // This also helps if the component remounts for other reasons.
        setLogoVersionKey(Date.now().toString());
        setIsLoading(false);
      };
      img.onerror = () => {
        setUseFallbackLogo(true); // Custom logo does not exist or is not loadable
        setIsLoading(false);
      };
    };

    checkLogoExistence();

    const handleLogoUpdatedEvent = () => {
      // When logo is updated, generate a new version key to force re-fetch
      // and reset error state to allow re-attempting to load the custom logo.
      setLogoVersionKey(Date.now().toString());
      setUseFallbackLogo(false); // Assume the new logo might exist
      setImageError(false);      // Reset error state for the new attempt
      setIsLoading(true);        // Briefly set loading while we re-evaluate

      // Re-check existence to confirm, this will update isLoading when done
      const reCheckImg = new window.Image();
      reCheckImg.src = `/site_logo.png?check=${Date.now()}`;
      reCheckImg.onload = () => {
        // setUseFallbackLogo(false); // Already set
        setIsLoading(false);
      };
      reCheckImg.onerror = () => {
        setUseFallbackLogo(true); // New logo couldn't be loaded either
        setIsLoading(false);
      };
    };

    window.addEventListener('logoUpdated', handleLogoUpdatedEvent);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdatedEvent);
    };
  }, []); // Empty dependency array, runs once on mount and cleans up

  const displayFallback = useFallbackLogo || imageError;
  const logoSrc = `/site_logo.png?v=${logoVersionKey}`;

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
            {displayFallback ? (
              <Layers3 size={28} className="text-primary w-full h-full" />
            ) : (
              <Image
                src={logoSrc}
                key={logoVersionKey} // Force re-render when version changes
                alt="Reactiverse Site Logo"
                layout="fill"
                objectFit="contain"
                data-ai-hint="site logo icon"
                onError={() => {
                  setImageError(true); // If this specific version fails, note the error
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

