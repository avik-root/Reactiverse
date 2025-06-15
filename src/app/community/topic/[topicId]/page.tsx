
// src/app/community/topic/[topicId]/page.tsx
import type { ForumTopic, ForumPost } from '@/lib/types';
import { getTopicDetailsAction, getPostsByTopicIdAction, getUserByIdAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageCircle, PlusCircle, Info, CalendarDays, User as UserIcon, ArrowLeft, Edit3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface TopicPageProps {
  params: { topicId: string };
}

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = params;
  const topic = await getTopicDetailsAction(topicId);

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
                <Link href="/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum</Link>
            </Button>
        </div>
      </div>
    );
  }

  const posts = await getPostsByTopicIdAction(topicId);
  // Note: In a real app, author details for posts might be fetched in batch or joined if using a DB
  // For JSON, if posts don't embed author, we might need another fetch or pass user list.
  // Assuming posts have authorName and authorAvatarUrl for now.

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href={`/community/category/${topic.categoryId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Category</Link>
        </Button>
      </div>

      {/* Topic Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{topic.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-4 pt-2">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={topic.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(topic.authorName)}`} alt={topic.authorName} data-ai-hint="author avatar" />
                <AvatarFallback className="text-xs">{getInitials(topic.authorName)}</AvatarFallback>
              </Avatar>
              <span>{topic.authorName}</span>
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

      {/* Posts Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold font-headline">Replies ({posts.length})</h2>
        {posts.length > 0 ? (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id}>
                <Card className="bg-card/80 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(post.authorName)}`} alt={post.authorName} data-ai-hint="author avatar" />
                                <AvatarFallback className="text-xs">{getInitials(post.authorName)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{post.authorName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                    </div>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Replies Yet</AlertTitle>
            <AlertDescription>
              Be the first to reply to this topic! (Replying functionality coming soon).
            </AlertDescription>
          </Alert>
        )}
      </section>

      {/* Reply Form Placeholder */}
      <section className="pt-8 border-t">
        <h3 className="text-xl font-semibold mb-4">Leave a Reply</h3>
        <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-primary/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                    Replying to topics is coming soon. Check back later to share your thoughts!
                </p>
                <Button className="mt-4 pointer-events-none opacity-60 cursor-not-allowed" variant="outline">
                    <Edit3 className="mr-2 h-4 w-4"/> Submit Reply (Soon)
                </Button>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
