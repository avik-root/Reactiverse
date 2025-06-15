
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare, Search, Lightbulb, Users, Palette, HelpCircle, Megaphone, Code2, Mail } from 'lucide-react';
import Link from 'next/link';
import { getForumCategoriesAction, subscribeToNewsletterAction, type SubscribeToNewsletterFormState } from '@/lib/actions';
import type { ForumCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';

const LucideIcons = {
  MessagesSquare,
  Palette,
  Code2,
  Lightbulb,
  Megaphone,
  HelpCircle,
  Users
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
        {pending ? 'Subscribing...' : 'Notify Me'}
      </Button>
    );
}


export default function CommunityForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const { toast } = useToast();

  const initialFormState: SubscribeToNewsletterFormState = { message: null, errors: {}, success: false };
  const [formState, formAction] = useActionState(subscribeToNewsletterAction, initialFormState);

  useEffect(() => {
    async function fetchCategories() {
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
    fetchCategories();
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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search forum topics (coming soon)..."
              className="pl-10 w-full"
              disabled
            />
          </div>

          <section>
            <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Explore Topics</h2>
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
            <h3 className="text-xl font-semibold mb-2">Our Forum is Under Construction!</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-4">
              We&apos;re actively building this space for you to connect. Full forum functionality, including posting and replying, is coming soon.
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
        </CardContent>
      </Card>
    </div>
  );
}

