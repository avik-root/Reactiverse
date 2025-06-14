
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminDataExistsAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRootPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (authIsLoading) {
      return; // Wait for AuthContext to finish loading its state
    }

    if (user && isAdmin) {
      // If AuthContext confirms an admin is logged in, go to dashboard
      router.replace('/admin/dashboard');
      return;
    }

    // If AuthContext shows no logged-in admin, proceed to check server-side status
    async function determineAdminRoute() {
      try {
        const { adminExists } = await checkAdminDataExistsAction();
        if (adminExists) {
          router.replace('/admin/login');
        } else {
          router.replace('/admin/create-account');
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        // Fallback to login page on error to be safe, or create-account if preferred
        router.replace('/admin/login');
      }
    }

    determineAdminRoute();

  }, [user, isAdmin, authIsLoading, router]);

  // Show a loader ONLY while AuthContext is loading.
  // Once authIsLoading is false, redirection logic in useEffect should take over.
  if (authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing Admin Area...</p>
      </div>
    );
  }

  // Once authIsLoading is false, this component should have already initiated a redirect.
  // Returning null prevents any flash of unstyled content or incorrect UI.
  return null;
}
