
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminDataExistsAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react'; 

export default function AdminRootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { adminExists } = await checkAdminDataExistsAction();
        if (adminExists) {
          router.replace('/admin/login');
        } else {
          router.replace('/admin/create-account');
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        // Fallback or error display, for now, attempt create account path
        router.replace('/admin/create-account');
      } finally {
        // A small delay to prevent flash of content if check is very fast
        // setTimeout(() => setIsLoading(false), 300);
        // No need for timeout if redirecting anyway
      }
    }
    checkAdminStatus();
  }, [router]);

  // Render a loading indicator while the check is in progress
  // This content will likely not be seen due to immediate redirection
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing Admin Area...</p>
      </div>
    );
  }

  return null; // Or a minimal loading state, as redirection should happen quickly
}
