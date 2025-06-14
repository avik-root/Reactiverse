
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminDataExistsAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Loader2 } from 'lucide-react';

export default function AdminRootPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authIsLoading } = useAuth(); // Get auth state
  const [checkingAdminData, setCheckingAdminData] = useState(true);

  useEffect(() => {
    // Wait for AuthContext to finish loading its state
    if (authIsLoading) {
      setCheckingAdminData(true); // Ensure loader shows while auth is loading
      return;
    }

    // If user is already identified as admin by AuthContext, go to dashboard
    if (user && isAdmin) {
      router.replace('/admin/dashboard');
      return; // Stop further execution in this effect
    }

    // If not an admin (or user not loaded yet by AuthContext but authIsLoading is false),
    // then check if admin data exists to decide between login/create-account
    async function checkAndRedirect() {
      setCheckingAdminData(true);
      try {
        const { adminExists } = await checkAdminDataExistsAction();
        if (adminExists) {
          router.replace('/admin/login');
        } else {
          router.replace('/admin/create-account');
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        router.replace('/admin/create-account'); // Fallback
      }
      // No need to setCheckingAdminData(false) here as redirection will unmount this page.
    }
    checkAndRedirect();

  }, [router, user, isAdmin, authIsLoading]);

  // Show a loader while AuthContext is loading or admin data check is in progress
  if (authIsLoading || checkingAdminData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing Admin Area...</p>
      </div>
    );
  }

  return null; // Should have redirected by now
}
