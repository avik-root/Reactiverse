
'use client';

import AdminCreateAccountForm from '@/components/auth/AdminCreateAccountForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminDataExistsAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

export default function AdminCreateAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [allowCreation, setAllowCreation] = useState(false);

  useEffect(() => {
    async function verifyAdminAbsence() {
      try {
        const { adminExists } = await checkAdminDataExistsAction();
        if (adminExists) {
          router.replace('/admin/login'); // Admin already exists, redirect to login
        } else {
          setAllowCreation(true); // No admin exists, allow creation form
        }
      } catch (error) {
        console.error("Error checking admin status for creation page:", error);
        // If error, conservatively redirect to login to prevent issues
        router.replace('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }
    verifyAdminAbsence();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verifying Admin Setup...</p>
      </div>
    );
  }

  if (!allowCreation) {
    // This state should ideally not be reached if redirection works,
    // but acts as a fallback or if checkAdminDataExistsAction is slow and setIsLoading(false) runs first
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-lg text-muted-foreground">Redirecting...</p>
        </div>
    );
  }
  
  return <AdminCreateAccountForm />;
}
