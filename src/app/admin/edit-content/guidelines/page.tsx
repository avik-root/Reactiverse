
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { GuidelinesPageContent, UpdatePageContentFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, ScrollText, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Guidelines Content</>}
    </Button>
  );
}

export default function EditGuidelinesPage() {
  const { toast } = useToast();
  const [initialContent, setInitialContent] = useState<GuidelinesPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<GuidelinesPageContent>>({ keyAreas: [] });

  const initialState: UpdatePageContentFormState<GuidelinesPageContent> = { message: null, errors: {}, success: false, content: null };
  const [state, formAction] = useActionState(
     (prevState: UpdatePageContentFormState<GuidelinesPageContent>, data: FormData) =>
      updatePageContentAction('guidelines', data) as Promise<UpdatePageContentFormState<GuidelinesPageContent>>,
    initialState
  );

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getPageContentAction('guidelines') as GuidelinesPageContent;
        setInitialContent(content);
        setFormData(content || { keyAreas: [] });
      } catch (error) {
        toast({ title: "Error", description: "Could not load Guidelines page content.", variant: "destructive" });
         setFormData({ keyAreas: [] });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyAreaChange = (index: number, value: string) => {
    setFormData(prev => {
      const newKeyAreas = [...(prev.keyAreas || [])];
      newKeyAreas[index] = value;
      return { ...prev, keyAreas: newKeyAreas };
    });
  };

  const addKeyArea = () => {
    setFormData(prev => ({ ...prev, keyAreas: [...(prev.keyAreas || []), ''] }));
  };

  const removeKeyArea = (index: number) => {
    setFormData(prev => ({ ...prev, keyAreas: (prev.keyAreas || []).filter((_, i) => i !== index) }));
  };

  const keyAreasJSON = JSON.stringify(formData.keyAreas || []);


  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.content) {
        setInitialContent(state.content as GuidelinesPageContent);
        setFormData(state.content as GuidelinesPageContent || { keyAreas: [] });
      }
    }
  }, [state, toast]);

  if (isLoading || !initialContent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><ScrollText className="mr-3 h-8 w-8 animate-pulse" /> Edit Design Guidelines Page</CardTitle>
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
          <ScrollText className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Edit Design Guidelines Page</CardTitle>
        </div>
        <CardDescription>Modify the content displayed on the public Design Guidelines page.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="keyAreasJSON" value={keyAreasJSON} />
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

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Key Areas Section</h3>
            <div className="space-y-2">
              <Label htmlFor="keyAreasTitle">"Key Areas We'll Cover" Title</Label>
              <Input id="keyAreasTitle" name="keyAreasTitle" value={formData.keyAreasTitle || ''} onChange={handleInputChange} />
              {state?.errors?.keyAreasTitle && <p className="text-sm text-destructive">{state.errors.keyAreasTitle.join(', ')}</p>}
            </div>
            <div className="space-y-3">
              <Label>Key Areas (List Items)</Label>
              {(formData.keyAreas || []).map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    name={`keyAreas[${index}]`}
                    value={area}
                    onChange={(e) => handleKeyAreaChange(index, e.target.value)}
                    placeholder={`Area #${index + 1}`}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeKeyArea(index)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
               {state?.errors?.keyAreas && Array.isArray(state.errors.keyAreas) && state.errors.keyAreas.length > 0 && typeof state.errors.keyAreas[0] === 'string' && <p className="text-sm text-destructive">{(state.errors.keyAreas as string[]).join(', ')}</p>}
               {state?.errors?.keyAreas && !Array.isArray(state.errors.keyAreas) && typeof state.errors.keyAreas === 'object' && Object.values(state.errors.keyAreas as Record<string, string[]>).flat().length > 0 && (
                 <p className="text-sm text-destructive">{(Object.values(state.errors.keyAreas as Record<string, string[]>).flat() as string[]).join(', ')}</p>
               )}


              <Button type="button" variant="outline" onClick={addKeyArea} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Key Area
              </Button>
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
