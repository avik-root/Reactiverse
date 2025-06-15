
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const REFRESH_INTERVAL = 5000; // 5 seconds

export default function AutoRefresher() {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      // You can uncomment the log below for debugging to see when refreshes happen
      // console.log('Auto-refreshing page data via router.refresh()...');
      router.refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [router]); // router object itself is stable, so this effect runs once on mount

  return null; // This component does not render anything itself
}
