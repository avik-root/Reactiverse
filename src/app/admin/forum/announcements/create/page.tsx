
// src/app/admin/forum/announcements/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CreateTopicForm from '@/components/forum/CreateTopicForm';
import { getCategoryBySlugAction } from '@/lib/actions';
import type { ForumCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Frown, MessageSquarePlus, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ANNOUNCEMENTS_CATEGORY_SLUG = 'announcements';

export default function CreateAdminAnnouncementPage() {
  const router = useRouter();
  const { user: adminUser, isAdmin, isLoading: authIsLoading } = useAuth();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDataAndAuthorize() {
      if (authIsLoading) return; // Wait for auth context to load

      if (!adminUser || !isAdmin) {
        setError("You must be an administrator to create an announcement.");
        setIsLoadingPageData(false);
        router.push('/admin/login'); // Or admin dashboard if preferred
        return;
      }

      setIsLoadingPageData(true);
      setError(null);

      try {
        const fetchedCategory = await getCategoryBySlugAction(ANNOUNCEMENTS_CATEGORY_SLUG);
        if (fetchedCategory) {
          setCategory(fetchedCategory);
        } else {
          setError("Announcements category not found. Please ensure it exists.");
        }
      } catch (e) {
        console.error("Error fetching announcements category:", e);
        setError("Could not load category data. Please try again later.");
      }
      setIsLoadingPageData(false);
    }

    fetchDataAndAuthorize();
  }, [adminUser, isAdmin, authIsLoading, router]);

  if (isLoadingPageData || authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Announcement Creator...</p>
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

  if (!category || !adminUser || !('id' in adminUser)) { // Ensure adminUser has id
    return (
       <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Setup Issue or Unauthorized</AlertTitle>
          <AlertDescription>Could not load necessary data or you are not authorized. Please ensure the 'announcements' category exists and you are logged in as an admin.</AlertDescription>
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
  
  const adminName = 'name' in adminUser ? adminUser.name : 'Admin';
  const adminAvatarUrl = 'avatarUrl' in adminUser ? adminUser.avatarUrl : undefined;


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
            <MessageSquarePlus className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">Create New Announcement</CardTitle>
          </div>
          <CardDescription>
            You are creating a new announcement in the &quot;<strong>{category.name}</strong>&quot; category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTopicForm
            categoryId={category.id}
            categorySlug={category.slug}
            userId={adminUser.id}
            userName={adminName || 'Administrator'}
            userAvatarUrl={adminAvatarUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}

