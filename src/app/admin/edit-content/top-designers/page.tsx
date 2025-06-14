
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { TopDesignersPageContent, UpdatePageContentFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Top Designers Content</>}
    </Button>
  );
}

export default function EditTopDesignersPage() {
  const { toast } = useToast();
  const [initialContent, setInitialContent] = useState<TopDesignersPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<TopDesignersPageContent>>({});

  const initialState: UpdatePageContentFormState<TopDesignersPageContent> = { message: null, errors: {}, success: false, content: null };
  const [state, formAction] = useActionState(
    (prevState: UpdatePageContentFormState<TopDesignersPageContent>, data: FormData) =>
      updatePageContentAction('topDesigners', data) as Promise<UpdatePageContentFormState<TopDesignersPageContent>>,
    initialState
  );

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getPageContentAction('topDesigners') as TopDesignersPageContent;
        setInitialContent(content);
        setFormData(content || {});
      } catch (error) {
        toast({ title: "Error", description: "Could not load Top Designers page content.", variant: "destructive" });
        setFormData({});
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.content) {
        setInitialContent(state.content as TopDesignersPageContent);
        setFormData(state.content as TopDesignersPageContent || {});
      }
    }
  }, [state, toast]);

  if (isLoading || !initialContent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Award className="mr-3 h-8 w-8 animate-pulse" /> Edit Top Designers Page</CardTitle>
          <CardDescription>Loading content...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Edit Top Designers Page</CardTitle>
        </div>
        <CardDescription>Modify the content displayed on the public Top Designers page.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-8">

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Header Section</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} />
              {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Page Description (Subtitle)</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Main Placeholder Content</h3>
            <div className="space-y-2">
              <Label htmlFor="mainPlaceholderTitle">Placeholder Title</Label>
              <Input id="mainPlaceholderTitle" name="mainPlaceholderTitle" value={formData.mainPlaceholderTitle || ''} onChange={handleInputChange} />
              {state?.errors?.mainPlaceholderTitle && <p className="text-sm text-destructive">{state.errors.mainPlaceholderTitle.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainPlaceholderContent">Placeholder Content</Label>
              <Textarea id="mainPlaceholderContent" name="mainPlaceholderContent" value={formData.mainPlaceholderContent || ''} onChange={handleInputChange} rows={4}/>
              {state?.errors?.mainPlaceholderContent && <p className="text-sm text-destructive">{state.errors.mainPlaceholderContent.join(', ')}</p>}
            </div>
          </section>

          {state?.errors?.general && <p className="text-sm text-destructive p-4 text-center">{state.errors.general.join(', ')}</p>}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
