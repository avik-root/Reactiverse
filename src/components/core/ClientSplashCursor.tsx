// src/components/core/ClientSplashCursor.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically import SplashCursor with SSR disabled
const DynamicSplashCursor = dynamic(() => import('@/components/effects/SplashCursor'), {
  ssr: false,
});

const ClientSplashCursor: React.FC = () => {
  return <DynamicSplashCursor />;
};

export default ClientSplashCursor;
