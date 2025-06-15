
// src/app/community/category/[slug]/page.tsx
import type { ForumCategory, ForumTopic } from '@/lib/types';
import { getCategoryBySlugAction, getTopicsByCategoryIdAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, MessageSquare, PlusCircle, Info, Users, CalendarDays, Eye, Tag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

interface CategoryPageProps {
  params: { slug: string };
}

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = await getCategoryBySlugAction(slug);

  if (!category) {
    return (
      <div className="container mx-auto py-12">
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

  const topics = await getTopicsByCategoryIdAction(category.id);

  return (
    <div className="container mx-auto py-12 space-y-8">
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
            <Button asChild variant="default" disabled>
              <Link href={`/community/category/${slug}/new-topic`} className="pointer-events-none opacity-60 cursor-not-allowed">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Topic (Soon)
              </Link>
            </Button>
          </div>

          {topics.length > 0 ? (
            <ul className="space-y-4">
              {topics.map((topic) => (
                <li key={topic.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        <Link
                          href={`/community/topic/${topic.id}`}
                          className="text-primary hover:underline pointer-events-none opacity-60 cursor-not-allowed"
                          aria-disabled="true"
                          tabIndex={-1}
                        >
                          {topic.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground space-x-3">
                        <div className="flex items-center">
                            <Avatar className="h-5 w-5 mr-1.5">
                                <AvatarImage src={topic.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(topic.authorName)}`} alt={topic.authorName} data-ai-hint="author avatar" />
                                <AvatarFallback className="text-xs">{getInitials(topic.authorName)}</AvatarFallback>
                            </Avatar>
                            <span>{topic.authorName}</span>
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
                          href={`/community/topic/${topic.id}`}
                          className="text-primary text-sm font-medium hover:underline pointer-events-none opacity-60 cursor-not-allowed"
                          aria-disabled="true"
                          tabIndex={-1}
                        >
                            Read More & Reply (Soon) &rarr;
                        </Link>
                   </div>
                </li>
              ))}
            </ul>
          ) : (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>No Topics Yet</AlertTitle>
              <AlertDescription>
                There are no topics in this category yet. Be the first to create one!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
