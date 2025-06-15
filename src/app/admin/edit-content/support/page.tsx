
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { SupportPageContent, UpdatePageContentFormState, FAQItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, LifeBuoy, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Support Page Content</>}
    </Button>
  );
}

export default function EditSupportPage() {
  const { toast } = useToast();
  const [initialContent, setInitialContent] = useState<SupportPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<SupportPageContent> & { faqsJSON?: string }>({});

  const initialState: UpdatePageContentFormState<SupportPageContent> = { message: null, errors: {}, success: false, content: null };
  const [state, formAction] = useActionState(
    (prevState: UpdatePageContentFormState<SupportPageContent>, data: FormData) =>
      updatePageContentAction('support', data) as Promise<UpdatePageContentFormState<SupportPageContent>>,
    initialState
  );

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getPageContentAction('support') as SupportPageContent;
        setInitialContent(content);
        setFormData({ ...content, faqsJSON: JSON.stringify(content.faqs || [], null, 2) });
      } catch (error) {
        toast({ title: "Error", description: "Could not load Support page content.", variant: "destructive" });
        setFormData({ faqsJSON: '[]' });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFaqsJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, faqsJSON: e.target.value }));
  };

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.content) {
        setInitialContent(state.content as SupportPageContent);
        setFormData({ ...state.content as SupportPageContent, faqsJSON: JSON.stringify((state.content as SupportPageContent).faqs || [], null, 2) });
      }
    }
  }, [state, toast]);

  if (isLoading || !initialContent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><LifeBuoy className="mr-3 h-8 w-8 animate-pulse" /> Edit Support Page</CardTitle>
          <CardDescription>Loading content...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Edit Support Page</CardTitle>
        </div>
        <CardDescription>Modify the content displayed on the public Support page.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-8">

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Header Section</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} />
              {state?.errors?.title && <p className="text-sm text-destructive">{(state.errors.title as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Page Description (Subtitle)</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.description && <p className="text-sm text-destructive">{(state.errors.description as string[]).join(', ')}</p>}
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Contact Us Section</h3>
            <div className="space-y-2">
              <Label htmlFor="emailSupportTitle">Email Support Title</Label>
              <Input id="emailSupportTitle" name="emailSupportTitle" value={formData.emailSupportTitle || ''} onChange={handleInputChange} />
              {state?.errors?.emailSupportTitle && <p className="text-sm text-destructive">{(state.errors.emailSupportTitle as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSupportDescription">Email Support Description</Label>
              <Textarea id="emailSupportDescription" name="emailSupportDescription" value={formData.emailSupportDescription || ''} onChange={handleInputChange} rows={2}/>
              {state?.errors?.emailSupportDescription && <p className="text-sm text-destructive">{(state.errors.emailSupportDescription as string[]).join(', ')}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input id="emailAddress" name="emailAddress" type="email" value={formData.emailAddress || ''} onChange={handleInputChange} />
              {state?.errors?.emailAddress && <p className="text-sm text-destructive">{(state.errors.emailAddress as string[]).join(', ')}</p>}
            </div>
            <hr className="my-4"/>
             <div className="space-y-2">
              <Label htmlFor="forumTitle">Community Forum Title</Label>
              <Input id="forumTitle" name="forumTitle" value={formData.forumTitle || ''} onChange={handleInputChange} />
              {state?.errors?.forumTitle && <p className="text-sm text-destructive">{(state.errors.forumTitle as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="forumDescription">Community Forum Description</Label>
              <Textarea id="forumDescription" name="forumDescription" value={formData.forumDescription || ''} onChange={handleInputChange} rows={2}/>
              {state?.errors?.forumDescription && <p className="text-sm text-destructive">{(state.errors.forumDescription as string[]).join(', ')}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="forumLinkText">Forum Link Text</Label>
              <Input id="forumLinkText" name="forumLinkText" value={formData.forumLinkText || ''} onChange={handleInputChange} />
              {state?.errors?.forumLinkText && <p className="text-sm text-destructive">{(state.errors.forumLinkText as string[]).join(', ')}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="forumLinkUrl">Forum Link URL (use # if not ready)</Label>
              <Input id="forumLinkUrl" name="forumLinkUrl" value={formData.forumLinkUrl || ''} onChange={handleInputChange} />
              {state?.errors?.forumLinkUrl && <p className="text-sm text-destructive">{(state.errors.forumLinkUrl as string[]).join(', ')}</p>}
            </div>
          </section>

           <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">FAQ Section</h3>
            <div className="space-y-2">
              <Label htmlFor="faqTitle">FAQ Section Title</Label>
              <Input id="faqTitle" name="faqTitle" value={formData.faqTitle || ''} onChange={handleInputChange} />
              {state?.errors?.faqTitle && <p className="text-sm text-destructive">{(state.errors.faqTitle as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqsJSON">FAQs (JSON Array)</Label>
              <Textarea 
                id="faqsJSON" 
                name="faqsJSON" 
                value={formData.faqsJSON || '[]'} 
                onChange={handleFaqsJsonChange} 
                rows={10}
                placeholder='[{"question": "Your question?", "answer": "Your answer."}]'
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500"/> Edit with care. Must be a valid JSON array of objects, each with "question" and "answer" string properties.
              </p>
              {state?.errors?.faqsJSON && <p className="text-sm text-destructive">{(state.errors.faqsJSON as string[]).join(', ')}</p>}
            </div>
          </section>

          {state?.errors?.general && <p className="text-sm text-destructive p-4 text-center">{(state.errors.general as string[]).join(', ')}</p>}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
