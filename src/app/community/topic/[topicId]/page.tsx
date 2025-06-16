

// src/app/community/topic/[topicId]/page.tsx
'use client';

import type { ForumTopic, ForumPost, AdminDeletePostResult } from '@/lib/types';
import { getTopicDetailsAction, adminDeleteForumPostAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MessageCircle, Info, CalendarDays, User as UserIcon, ArrowLeft, BadgeCheck, Loader2, Trash2 } from 'lucide-react';
import SealCheckIcon from '@/components/icons/SealCheckIcon'; // Import the new icon
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostForm from '@/components/forum/CreatePostForm';
import { useToast } from '@/hooks/use-toast';

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
};


export default function TopicPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const { toast } = useToast();

  const topicId = typeof params.topicId === 'string' ? params.topicId : null;
  const categorySlug = searchParamsHook.get('categorySlug');

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isAdmin, isLoading: authIsLoading } = useAuth();

  const [postToDelete, setPostToDelete] = useState<ForumPost | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);


  const fetchTopicData = useCallback(async () => {
    if (!topicId) {
      setError("Topic ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTopic = await getTopicDetailsAction(topicId, categorySlug || undefined);
      if (fetchedTopic) {
        setTopic(fetchedTopic);
        setPosts(fetchedTopic.posts || []);
      } else {
        setError("Topic not found or could not be loaded.");
      }
    } catch (e) {
      console.error("Error fetching topic details:", e);
      setError("Failed to load topic. Please try again later.");
    }
    setIsLoading(false);
  }, [topicId, categorySlug]);

  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);

  const handlePostCreated = (newPost: ForumPost) => {
    setPosts(prevPosts => [...prevPosts, newPost]);
    setTopic(prevTopic => {
        if (!prevTopic) return null;
        return {
            ...prevTopic,
            replyCount: (prevTopic.replyCount || 0) + 1,
            lastRepliedAt: newPost.createdAt,
        };
    });
  };

  const handleDeletePostClick = (post: ForumPost) => {
    setPostToDelete(post);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete || !topic || !categorySlug) return;

    const result: AdminDeletePostResult = await adminDeleteForumPostAction(postToDelete.id, topic.id, categorySlug);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      setTopic(prevTopic => {
        if (!prevTopic) return null;
        return {
          ...prevTopic,
          replyCount: Math.max(0, (prevTopic.replyCount || 1) - 1),
        };
      });
    }
    setIsDeleteAlertOpen(false);
    setPostToDelete(null);
  };


  if (isLoading || authIsLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Topic...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6">
            <Button asChild variant="outline">
                <Link href={categorySlug ? `/community/category/${categorySlug}` : "/community"}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
            </Button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Topic Not Found</AlertTitle>
          <AlertDescription>The forum topic you are looking for does not exist or could not be loaded.</AlertDescription>
        </Alert>
         <div className="mt-6">
            <Button asChild variant="outline">
                <Link href={categorySlug ? `/community/category/${categorySlug}` : "/community"}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
            </Button>
        </div>
      </div>
    );
  }

  const isTopicAuthorAdmin = topic.createdByUserId.startsWith('admin-');
  const topicAuthorDisplayName = topic.authorName;
  const topicAuthorDisplayAvatar = topic.authorAvatarUrl || `https://placehold.co/40x40.png?text=${getInitials(topic.authorName)}`;
  const topicAuthorFallbackInitials = getInitials(topic.authorName);

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href={`/community/category/${categorySlug || topic.categoryId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Category</Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{topic.title}</CardTitle>
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1 pt-2">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={topicAuthorDisplayAvatar} alt={topicAuthorDisplayName} data-ai-hint={isTopicAuthorAdmin ? "admin avatar" : "author avatar"} />
                <AvatarFallback className="text-xs">{topicAuthorFallbackInitials}</AvatarFallback>
              </Avatar>
              <span>{topicAuthorDisplayName}</span>
              {isTopicAuthorAdmin && <BadgeCheck className="h-4 w-4 text-primary ml-1" />}
              {!isTopicAuthorAdmin && topic.authorIsVerified && <SealCheckIcon className="ml-1.5 h-4 w-4 text-blue-500" />}
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              <span>Created: {format(new Date(topic.createdAt), "PPP p")}</span>
            </div>
             <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1.5 text-accent" />
              <span>{topic.replyCount} Replies</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap break-words">
            {topic.content}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold font-headline">Replies ({posts.length})</h2>
        {posts.length > 0 ? (
          <ul className="space-y-6">
            {posts.map((post) => {
              const isPostAuthorAdmin = post.createdByUserId.startsWith('admin-');
              const postAuthorDisplayName = post.authorName;
              const postAuthorDisplayAvatar = post.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(post.authorName)}`;
              const postAuthorFallbackInitials = getInitials(post.authorName);

              return (
                <li key={post.id}>
                  <Card className="bg-card/80 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={postAuthorDisplayAvatar} alt={postAuthorDisplayName} data-ai-hint={isPostAuthorAdmin ? "admin avatar" : "author avatar"} />
                                  <AvatarFallback className="text-xs">{postAuthorFallbackInitials}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm flex items-center">
                                {postAuthorDisplayName}
                                {isPostAuthorAdmin && <BadgeCheck className="h-4 w-4 text-primary ml-1.5" />}
                                {!isPostAuthorAdmin && post.authorIsVerified && <SealCheckIcon className="ml-1.5 h-4 w-4 text-blue-500" />}
                              </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeletePostClick(post)}
                                    aria-label="Delete post"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                          </div>
                      </div>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap break-words">
                      {post.content}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          !currentUser && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Replies Yet</AlertTitle>
                <AlertDescription>
                    Be the first to reply to this topic!
                </AlertDescription>
            </Alert>
          )
        )}
      </section>

      {currentUser && 'id' in currentUser && topicId && categorySlug ? (
        <section className="pt-8 border-t">
          <h3 className="text-xl font-semibold mb-4">Leave a Reply</h3>
          <CreatePostForm
            topicId={topicId}
            categorySlug={categorySlug}
            userId={currentUser.id}
            userName={currentUser.name || 'User'}
            userAvatarUrl={currentUser.avatarUrl}
            onPostCreated={handlePostCreated}
          />
        </section>
      ) : (
         <section className="pt-8 border-t text-center">
             <Alert className="max-w-md mx-auto">
                <Info className="h-4 w-4" />
                <AlertTitle>Login to Reply</AlertTitle>
                <AlertDescription>
                    You must be logged in to post a reply.
                    <Button asChild variant="link" className="px-1 py-0 h-auto text-accent">
                        <Link href={`/auth/login?redirect=${encodeURIComponent(`/community/topic/${topicId}?categorySlug=${categorySlug}`)}`}>Login here</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </section>
      )}

      {postToDelete && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={(isOpen) => { if (!isOpen) setPostToDelete(null); setIsDeleteAlertOpen(isOpen);}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Post Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setIsDeleteAlertOpen(false); setPostToDelete(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeletePost}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, delete post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
