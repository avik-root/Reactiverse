
// src/app/community/category/[slug]/new-topic/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CreateTopicForm from '@/components/forum/CreateTopicForm';
import { getCategoryBySlugAction } from '@/lib/actions';
import type { ForumCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Frown, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isLoading: authIsLoading } = useAuth();

  const slugFromParams = typeof params.slug === 'string' ? params.slug : null;
  const slug = slugFromParams ? slugFromParams.toLowerCase() : null; // Convert to lowercase

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function fetchDataAndAuthorize() {
      if (!slug) {
        setError("Category slug is missing.");
        setIsLoadingPageData(false);
        setIsAuthorized(false);
        return;
      }

      if (authIsLoading) return; // Wait for auth context to load

      setIsLoadingPageData(true);
      setError(null);

      try {
        const fetchedCategory = await getCategoryBySlugAction(slug); // Use lowercase slug
        if (fetchedCategory) {
          setCategory(fetchedCategory);
          // Authorization check
          if (!user) {
            setError("You must be logged in to create a topic.");
            setIsAuthorized(false);
            router.push(`/auth/login?redirect=/community/category/${slug}/new-topic`);
          } else if (fetchedCategory.slug === 'announcements' && !isAdmin) {
            setError("Only administrators can create announcements.");
            setIsAuthorized(false);
            router.push(`/community/category/${slug}`);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setError("Category not found.");
          setIsAuthorized(false);
        }
      } catch (e) {
        console.error("Error fetching category or authorizing:", e);
        setError("Could not load category data or authorize. Please try again later.");
        setIsAuthorized(false);
      }
      setIsLoadingPageData(false);
    }

    fetchDataAndAuthorize();
  }, [slug, user, isAdmin, authIsLoading, router]);

  if (isLoadingPageData || authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading New Topic Page...</p>
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
            <Link href={category ? `/community/category/${category.slug}` : "/community"}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !category || !user) {
    // This state should ideally be caught by the error or redirect logic above
    return (
       <div className="container mx-auto py-12">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <Frown className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You are not authorized to create a topic in this category, or the category could not be loaded.</AlertDescription>
        </Alert>
         <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href={category ? `/community/category/${category.slug}` : "/community"}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <MessageSquarePlus className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">Create New Topic</CardTitle>
          </div>
          <CardDescription>
            You are creating a new topic in the &quot;<strong>{category.name}</strong>&quot; category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTopicForm
            categoryId={category.id}
            categorySlug={category.slug} // Original slug (lowercase) from fetchedCategory
            userId={user.id}
            userName={user.name || 'Anonymous User'}
            userAvatarUrl={user.avatarUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
