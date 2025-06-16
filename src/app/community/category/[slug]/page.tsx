

// src/app/community/category/[slug]/page.tsx
'use client';

import type { ForumCategory, ForumTopic } from '@/lib/types';
import { getCategoryBySlugAction, getTopicsByCategoryIdAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, MessageSquare, PlusCircle, Info, Users, CalendarDays, Eye, Tag, ShieldAlert, LogIn, ArrowLeft, BadgeCheck, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';


const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
};


export default function CategoryPage() {
  const params = useParams();
  const slugFromParams = typeof params.slug === 'string' ? params.slug : null;
  const slug = slugFromParams ? slugFromParams.toLowerCase() : null;

  const { user, isAdmin, isLoading: authIsLoading } = useAuth();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!slug) {
        setError("Category slug is missing.");
        setIsLoadingPageData(false);
        return;
      }
      setIsLoadingPageData(true);
      setError(null);
      try {
        const fetchedCategory = await getCategoryBySlugAction(slug);
        if (fetchedCategory) {
          setCategory(fetchedCategory);
          const fetchedTopics = await getTopicsByCategoryIdAction(fetchedCategory.id);
          setTopics(fetchedTopics);
        } else {
          setError("Category not found.");
        }
      } catch (e) {
        console.error("Error fetching category page data:", e);
        setError("Could not load category data. Please try again later.");
      }
      setIsLoadingPageData(false);
    }
    fetchData();
  }, [slug]);

  const getCreateTopicButtonInfo = () => {
    if (!category || !slug) return null;

    const baseHref = `/community/category/${slug}/new-topic`;

    // Announcements are now created from admin panel
    if (category.slug === 'announcements') {
      return null;
    }
    
    if (user) {
      return { text: "Create New Topic", disabled: false, href: baseHref, icon: <PlusCircle className="mr-2 h-5 w-5" /> };
    }
    
    const redirectUrl = `/community/category/${slug}`;
    return { text: "Login to Create Topic", disabled: false, href: `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`, icon: <LogIn className="mr-2 h-5 w-5" /> };
  };

  const createTopicButtonInfo = getCreateTopicButtonInfo();


  if (authIsLoading || isLoadingPageData) {
    return (
      <div className="container mx-auto py-12 space-y-8">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum Categories</Link>
            </Button>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-1/4" />
              {slug !== 'announcements' && <Skeleton className="h-10 w-48" />}
            </div>
            <ul className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="border p-4 rounded-lg bg-card">
                  <Skeleton className="h-6 w-3/5 mb-2" />
                  <div className="flex items-center text-xs space-x-3 mb-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
         <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum Categories</Link>
            </Button>
        </div>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
            <Button asChild variant="outline">
                <Link href="/community">Back to Forum Categories</Link>
            </Button>
        </div>
      </div>
    );
  }

  if (!category) {
     return (
      <div className="container mx-auto py-12">
         <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum Categories</Link>
            </Button>
        </div>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Category Not Found</AlertTitle>
          <AlertDescription>The forum category you are looking for does not exist or could not be loaded.</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
            <Button asChild variant="outline">
                <Link href="/community">Back to Forum Categories</Link>
            </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 space-y-8">
       <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum Categories</Link>
            </Button>
        </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <Tag className="mr-3 h-8 w-8" />
            {category.name}
          </CardTitle>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{topics.length} topic(s) in this category.</p>
            {createTopicButtonInfo && (
             <Button asChild variant="default" disabled={createTopicButtonInfo.disabled} className={createTopicButtonInfo.disabled ? "opacity-70 cursor-not-allowed" : ""}>
              <Link href={createTopicButtonInfo.href}>
                {createTopicButtonInfo.icon || <PlusCircle className="mr-2 h-5 w-5" />}
                {createTopicButtonInfo.text}
              </Link>
            </Button>
            )}
          </div>

          {topics.length > 0 ? (
            <ul className="space-y-4">
              {topics.map((topic) => {
                const isAuthorAdmin = topic.createdByUserId.startsWith('admin-');
                const authorDisplayName = topic.authorName; 
                const authorDisplayAvatar = topic.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(topic.authorName)}`;
                const authorFallbackInitials = getInitials(topic.authorName);

                return (
                  <li key={topic.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          <Link
                            href={`/community/topic/${topic.id}?categorySlug=${category.slug}`}
                            className="text-primary hover:underline"
                          >
                            {topic.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground space-x-3">
                          <div className="flex items-center">
                              <Avatar className="h-5 w-5 mr-1.5">
                                  <AvatarImage src={authorDisplayAvatar} alt={authorDisplayName} data-ai-hint={isAuthorAdmin ? "admin avatar" : "author avatar"} />
                                  <AvatarFallback className="text-xs">{authorFallbackInitials}</AvatarFallback>
                              </Avatar>
                              <span>{authorDisplayName}</span>
                              {isAuthorAdmin && <BadgeCheck className="h-3.5 w-3.5 text-primary ml-1" />}
                              {!isAuthorAdmin && topic.authorIsVerified && <CheckCircle className="ml-1.5 h-3.5 w-3.5 text-blue-500 fill-blue-500" />}
                          </div>
                          <div className="flex items-center">
                              <CalendarDays className="h-3.5 w-3.5 mr-1" />
                              <span>{format(new Date(topic.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground text-right">
                          <div className="flex items-center justify-end">
                              <MessageSquare className="h-4 w-4 mr-1.5 text-accent" /> {topic.replyCount} Replies
                          </div>
                          <div className="flex items-center justify-end">
                              <Eye className="h-4 w-4 mr-1.5 text-accent" /> {topic.viewCount} Views
                          </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{topic.content}</p>
                    <div className="mt-3">
                          <Link
                            href={`/community/topic/${topic.id}?categorySlug=${category.slug}`}
                            className="text-primary text-sm font-medium hover:underline"
                          >
                              Read More & Reply &rarr;
                          </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>No Topics Yet</AlertTitle>
              <AlertDescription>
                There are no topics in this category yet.
                {createTopicButtonInfo && !createTopicButtonInfo.disabled && (
                 <Button asChild variant="link" className="p-0 h-auto ml-1 text-accent">
                    <Link href={createTopicButtonInfo.href}>Be the first to create one!</Link>
                 </Button>
                )}
                 {createTopicButtonInfo && createTopicButtonInfo.disabled && createTopicButtonInfo.text.includes("Login") && (
                     <Button asChild variant="link" className="p-0 h-auto ml-1 text-accent">
                        <Link href={createTopicButtonInfo.href}>Login to create one.</Link>
                     </Button>
                 )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

