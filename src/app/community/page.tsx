
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare, Search, Lightbulb, Users, Palette, HelpCircle, Megaphone, Code2, Mail, Info, Filter, LayoutList, Loader2, FileText, CalendarDays, Eye, Tag, ShieldAlert, XCircle, AlertTriangle, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { getForumCategoriesAction, subscribeToNewsletterAction, searchAllForumTopicsAction, type SubscribeToNewsletterFormState } from '@/lib/actions';
import type { ForumCategory, ForumTopic } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useActionState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LucideIcons = {
  MessagesSquare,
  Palette,
  Code2,
  Lightbulb,
  Megaphone,
  HelpCircle,
  Users,
  Info,
  Filter,
  LayoutList,
};

type IconName = keyof typeof LucideIcons;


interface ForumCategoryCardProps {
  category: ForumCategory;
}

function ForumCategoryCard({ category }: ForumCategoryCardProps) {
  const IconComponent = LucideIcons[category.iconName as IconName] || HelpCircle; // Fallback to HelpCircle

  return (
    <Card className="hover:shadow-lg transition-shadow bg-card hover:bg-muted/50">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
        <div className="bg-primary/10 p-3 rounded-lg text-primary">
          <IconComponent className="h-6 w-6" />
        </div>
        <CardTitle className="font-headline text-xl text-primary">{category.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground h-12 line-clamp-3">{category.description}</p>
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Topics: {category.topicCount || 0}</span>
          <span>Posts: {category.postCount || 0}</span>
        </div>
        <Button asChild variant="outline" className="w-full">
            <Link href={`/community/category/${category.slug}`}>
              View Topics
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function NewsletterSubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subscribing...</> : 'Notify Me'}
      </Button>
    );
}

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
};


export default function CommunityForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const { toast } = useToast();

  const initialFormState: SubscribeToNewsletterFormState = { message: null, errors: {}, success: false };
  const [formState, formAction] = useActionState(subscribeToNewsletterAction, initialFormState);

  const [searchInput, setSearchInput] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchResults, setSearchResults] = useState<ForumTopic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    async function fetchCategoriesData() {
      setIsLoadingCategories(true);
      setFetchError(false);
      try {
        const fetchedCategories = await getForumCategoriesAction();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch forum categories:", error);
        setFetchError(true);
      }
      setIsLoadingCategories(false);
    }
    fetchCategoriesData();
  }, []);

  useEffect(() => {
    if (formState?.message) {
      toast({
        title: formState.success ? 'Success!' : 'Subscription Failed',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success) {
        const formElement = document.getElementById('newsletterForm') as HTMLFormElement;
        formElement?.reset();
      }
    }
  }, [formState, toast]);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast({ title: "Search Error", description: "Please enter a term to search.", variant: "destructive" });
      return;
    }
    setSearchTerm(searchInput.trim()); 
    setIsSearching(true);
    setSearchPerformed(true);
    try {
      const results = await searchAllForumTopicsAction(searchInput.trim());
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching topics:", error);
      toast({ title: "Search Error", description: "Could not perform search.", variant: "destructive" });
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchInput(''); 
    setSearchTerm('');   
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const getCategorySlugForTopic = (categoryId: string): string | undefined => {
    return categories.find(cat => cat.id === categoryId)?.slug;
  };


  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Users className="mr-3 h-8 w-8" />
            Community Forum
          </CardTitle>
          <CardDescription>Connect, share, and learn with fellow designers and developers in the Reactiverse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">

          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search all forum topics..."
                className="pl-10 w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full sm:w-auto">
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
            </Button>
            {searchPerformed && (
              <Button onClick={handleClearSearch} variant="outline" className="w-full sm:w-auto">
                <XCircle className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>

          {isSearching && (
            <div className="text-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Searching topics...</p>
            </div>
          )}

          {!isSearching && searchPerformed && (
            <section>
              <h2 className="text-2xl font-semibold font-headline mb-6">
                Search Results for &quot;{searchTerm}&quot; ({searchResults.length})
              </h2>
              {searchResults.length > 0 ? (
                <ul className="space-y-4">
                  {searchResults.map((topic) => {
                    const categorySlug = getCategorySlugForTopic(topic.categoryId);
                    const isAuthorAdmin = topic.createdByUserId.startsWith('admin-');
                    // authorName and authorAvatarUrl are dynamically set by the server action for admins
                    const authorDisplayName = topic.authorName;
                    const authorDisplayAvatar = topic.authorAvatarUrl || `https://placehold.co/32x32.png?text=${getInitials(topic.authorName)}`;
                    const authorFallbackInitials = getInitials(topic.authorName);

                    return (
                      <li key={topic.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-card">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              <Link
                                href={`/community/topic/${topic.id}?categorySlug=${categorySlug || topic.categoryId}`}
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
                              </div>
                              <div className="flex items-center">
                                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                  <span>{format(new Date(topic.createdAt), "MMM d, yyyy")}</span>
                              </div>
                               {categorySlug && (
                                <div className="flex items-center">
                                  <Tag className="h-3.5 w-3.5 mr-1 text-accent" />
                                  <span>{categories.find(c=>c.slug === categorySlug)?.name || 'Category'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground text-right">
                              <div className="flex items-center justify-end">
                                  <MessagesSquare className="h-4 w-4 mr-1.5 text-accent" /> {topic.replyCount} Replies
                              </div>
                              <div className="flex items-center justify-end">
                                  <Eye className="h-4 w-4 mr-1.5 text-accent" /> {topic.viewCount} Views
                              </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{topic.content}</p>
                        <div className="mt-3">
                              <Link
                                href={`/community/topic/${topic.id}?categorySlug=${categorySlug || topic.categoryId}`}
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
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Results Found</AlertTitle>
                  <AlertDescription>
                    Your search for &quot;{searchTerm}&quot; did not match any topics. Try different keywords or check spelling.
                  </AlertDescription>
                </Alert>
              )}
            </section>
          )}

          {!searchPerformed && (
            <>
              <section>
                <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Explore Topics by Category</h2>
                {isLoadingCategories ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="bg-card">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                                    <Skeleton className="h-12 w-12 rounded-lg bg-muted/50" />
                                    <Skeleton className="h-6 w-3/4 rounded-md bg-muted/50" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-12 w-full rounded-md bg-muted/50" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-1/3 rounded-md bg-muted/50" />
                                        <Skeleton className="h-4 w-1/3 rounded-md bg-muted/50" />
                                    </div>
                                    <Skeleton className="h-10 w-full rounded-md bg-muted/50" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : fetchError ? (
                    <div className="text-center text-destructive py-10">
                        <p>Could not load forum categories. Please try again later.</p>
                    </div>
                ) : categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                      <ForumCategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                ) : (
                     <div className="text-center text-muted-foreground py-10">
                        <p>No forum categories available at the moment.</p>
                    </div>
                )}
              </section>

              <section className="text-center py-8 bg-muted/30 rounded-lg">
                <MessagesSquare className="h-16 w-16 text-primary/60 mb-4 mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Our Forum is Growing!</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-4">
                  We&apos;re actively working on new features and improvements.
                </p>
                <p className="text-sm text-accent">Thank you for your patience and stay tuned for exciting updates!</p>
              </section>

              <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold mb-3 text-center">Want to be notified when full features launch?</h3>
                    <form id="newsletterForm" action={formAction} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <div className="relative flex-grow">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="pl-10 flex-grow"
                                required
                                aria-describedby="newsletter-email-error"
                            />
                        </div>
                        <NewsletterSubmitButton />
                    </form>
                    {formState?.errors?.email && <p id="newsletter-email-error" className="text-sm text-destructive text-center mt-1">{formState.errors.email.join(', ')}</p>}
                    {formState?.errors?.general && <p className="text-sm text-destructive text-center mt-1">{formState.errors.general.join(', ')}</p>}
                     <p className="text-xs text-muted-foreground text-center mt-2">Sign up for updates on new features and community news!</p>
                </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

