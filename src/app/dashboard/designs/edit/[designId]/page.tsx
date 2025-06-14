
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Design } from '@/lib/types';
import { getDesignByIdAction } from '@/lib/actions';
import EditDesignForm from '@/components/dashboard/forms/EditDesignForm';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditDesignPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const designId = typeof params.designId === 'string' ? params.designId : undefined;
  
  const [design, setDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDesign() {
      if (!designId) {
        setError('Design ID is missing.');
        setIsLoading(false);
        return;
      }
      if (!user || !('id' in user)) {
        // User not loaded yet or not a regular user
        return; 
      }

      setIsLoading(true);
      try {
        const fetchedDesign = await getDesignByIdAction(designId);
        if (fetchedDesign) {
          if (fetchedDesign.submittedByUserId !== user.id) {
            setError('You are not authorized to edit this design.');
            router.push('/dashboard/designs'); // Redirect if not authorized
          } else {
            setDesign(fetchedDesign);
          }
        } else {
          setError('Design not found.');
        }
      } catch (e) {
        console.error("Failed to fetch design for editing:", e);
        setError('Failed to load design data.');
      }
      setIsLoading(false);
    }

    if (user) { // Only fetch if user is loaded
        fetchDesign();
    }
  }, [designId, user, router]);

  if (isLoading || !user) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Edit className="mr-2 h-7 w-7 animate-pulse" /> Loading Design Editor...
          </CardTitle>
          <CardDescription>Preparing your design for editing.</CardDescription>
        </CardHeader>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-md" />
          <Skeleton className="h-8 w-1/2 rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-1/3 rounded-md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!design) {
     return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Design Not Found</AlertTitle>
        <AlertDescription>The design you are trying to edit could not be found or you do not have permission to edit it.</AlertDescription>
      </Alert>
    );
  }

  return <EditDesignForm design={design} />;
}
