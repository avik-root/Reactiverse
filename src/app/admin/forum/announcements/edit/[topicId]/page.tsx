
// src/app/admin/forum/announcements/edit/[topicId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTopicDetailsAction } from '@/lib/actions';
import type { ForumTopic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Frown, Edit as EditIcon, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EditAnnouncementForm from '@/components/admin/forum/EditAnnouncementForm';

const ANNOUNCEMENTS_CATEGORY_SLUG = 'announcements';

export default function EditAdminAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser, isAdmin, isLoading: authIsLoading } = useAuth();
  
  const topicId = typeof params.topicId === 'string' ? params.topicId : null;

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDataAndAuthorize() {
      if (authIsLoading) return; 

      if (!adminUser || !isAdmin) {
        setError("You must be an administrator to edit an announcement.");
        setIsLoadingPageData(false);
        router.push('/admin/login');
        return;
      }

      if (!topicId) {
        setError("Announcement ID is missing.");
        setIsLoadingPageData(false);
        return;
      }

      setIsLoadingPageData(true);
      setError(null);

      try {
        const fetchedTopic = await getTopicDetailsAction(topicId, ANNOUNCEMENTS_CATEGORY_SLUG);
        if (fetchedTopic) {
            if (fetchedTopic.categoryId !== (await getCategoryBySlugAction(ANNOUNCEMENTS_CATEGORY_SLUG))?.id) {
                 setError("This topic does not belong to the Announcements category.");
                 setTopic(null);
            } else {
                 setTopic(fetchedTopic);
            }
        } else {
          setError("Announcement not found or could not be loaded.");
        }
      } catch (e) {
        console.error("Error fetching announcement for editing:", e);
        setError("Could not load announcement data. Please try again later.");
      }
      setIsLoadingPageData(false);
    }

    fetchDataAndAuthorize();
  }, [topicId, adminUser, isAdmin, authIsLoading, router]);

  if (isLoadingPageData || authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Announcement Editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <Frown className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/admin/forum/announcements">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!topic || !adminUser || !('id' in adminUser)) { 
    return (
       <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Data Issue or Unauthorized</AlertTitle>
          <AlertDescription>Could not load announcement details or you are not authorized. Please ensure the announcement exists and you are logged in as an admin.</AlertDescription>
        </Alert>
         <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/admin/forum/announcements">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/admin/forum/announcements">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Announcements
            </Link>
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <EditIcon className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">Edit Announcement</CardTitle>
          </div>
          <CardDescription>
            Modify the title and content of the announcement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAnnouncementForm topic={topic} adminId={adminUser.id} />
        </CardContent>
      </Card>
    </div>
  );
}
