
'use client'
import SignupForm from '@/components/auth/SignupForm';
import { getSiteSettingsAction } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function SignupPage() {
  const [allowRegistrations, setAllowRegistrations] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkRegistrationStatus() {
      setIsLoading(true);
      try {
        const settings = await getSiteSettingsAction();
        setAllowRegistrations(settings.allowNewUserRegistrations);
      } catch (error) {
        console.error("Failed to fetch site settings for signup:", error);
        setAllowRegistrations(true); // Default to true if settings fetch fails
      }
      setIsLoading(false);
    }
    checkRegistrationStatus();
  }, []);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-lg space-y-6">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <div className="space-y-4 p-6 border rounded-lg">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
        </div>
    );
  }


  if (allowRegistrations === false) { // Explicitly check for false
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Alert variant="default" className="max-w-md text-center">
          <Info className="h-5 w-5 mx-auto mb-2 text-primary" />
          <AlertTitle className="text-xl font-headline">Registrations Closed</AlertTitle>
          <AlertDescription className="mt-2">
            New user registrations are currently disabled by the site administrator. 
            Please check back later or contact support if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <SignupForm />;
}
