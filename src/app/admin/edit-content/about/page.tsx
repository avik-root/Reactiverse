
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { AboutUsContent, UpdatePageContentFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Info, Layers3, Sparkles, Users, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save About Us Content</>}
    </Button>
  );
}

export default function EditAboutUsPage() {
  const { toast } = useToast();
  const [initialContent, setInitialContent] = useState<AboutUsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<AboutUsContent>>({ offerItems: [] });

  const initialState: UpdatePageContentFormState<AboutUsContent> = { message: null, errors: {}, success: false, content: null };
  const [state, formAction] = useActionState(
    (prevState: UpdatePageContentFormState<AboutUsContent>, data: FormData) =>
      updatePageContentAction('aboutUs', data) as Promise<UpdatePageContentFormState<AboutUsContent>>,
    initialState
  );

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getPageContentAction('aboutUs') as AboutUsContent;
        setInitialContent(content);
        setFormData(content || { offerItems: [] });
      } catch (error) {
        toast({ title: "Error", description: "Could not load About Us page content.", variant: "destructive" });
         setFormData({ offerItems: [] });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfferItemChange = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => {
        const newOfferItems = [...(prev.offerItems || [])];
        if(newOfferItems[index]) {
            newOfferItems[index] = { ...newOfferItems[index], [field]: value };
        } else {
             newOfferItems[index] = { title: field === 'title' ? value : '', description: field === 'description' ? value : '' };
        }
        return { ...prev, offerItems: newOfferItems };
    });
  };

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.content) {
        setInitialContent(state.content as AboutUsContent);
        setFormData(state.content as AboutUsContent || { offerItems: [] });
      }
    }
  }, [state, toast]);

  if (isLoading || !initialContent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Info className="mr-3 h-8 w-8 animate-pulse" /> Edit About Us Page</CardTitle>
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
          <Info className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Edit About Us Page</CardTitle>
        </div>
        <CardDescription>Modify the content displayed on the public About Us page.</CardDescription>
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
            <h3 className="text-xl font-semibold font-headline text-primary">Mission Section</h3>
            <div className="space-y-2">
              <Label htmlFor="missionTitle">Mission Title</Label>
              <Input id="missionTitle" name="missionTitle" value={formData.missionTitle || ''} onChange={handleInputChange} />
              {state?.errors?.missionTitle && <p className="text-sm text-destructive">{state.errors.missionTitle.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionContentP1">Mission Content Paragraph 1</Label>
              <Textarea id="missionContentP1" name="missionContentP1" value={formData.missionContentP1 || ''} onChange={handleInputChange} rows={4}/>
              {state?.errors?.missionContentP1 && <p className="text-sm text-destructive">{state.errors.missionContentP1.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionContentP2">Mission Content Paragraph 2</Label>
              <Textarea id="missionContentP2" name="missionContentP2" value={formData.missionContentP2 || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.missionContentP2 && <p className="text-sm text-destructive">{state.errors.missionContentP2.join(', ')}</p>}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image1Url">Mission Image URL</Label>
                  <Input id="image1Url" name="image1Url" value={formData.image1Url || ''} onChange={handleInputChange} placeholder="https://placehold.co/600x400.png"/>
                  {state?.errors?.image1Url && <p className="text-sm text-destructive">{state.errors.image1Url.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image1Alt">Mission Image Alt Text</Label>
                  <Input id="image1Alt" name="image1Alt" value={formData.image1Alt || ''} onChange={handleInputChange} placeholder="Collaborative design process"/>
                  {state?.errors?.image1Alt && <p className="text-sm text-destructive">{state.errors.image1Alt.join(', ')}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="image1DataAiHint">Mission Image AI Hint</Label>
                  <Input id="image1DataAiHint" name="image1DataAiHint" value={formData.image1DataAiHint || ''} onChange={handleInputChange} placeholder="collaboration team"/>
                  {state?.errors?.image1DataAiHint && <p className="text-sm text-destructive">{state.errors.image1DataAiHint.join(', ')}</p>}
                </div>
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">What We Offer Section</h3>
            <div className="space-y-2">
              <Label htmlFor="offerTitle">"What We Offer" Title</Label>
              <Input id="offerTitle" name="offerTitle" value={formData.offerTitle || ''} onChange={handleInputChange} />
              {state?.errors?.offerTitle && <p className="text-sm text-destructive">{state.errors.offerTitle.join(', ')}</p>}
            </div>
            {(formData.offerItems || []).map((item, index) => (
              <div key={index} className="p-4 border rounded-md space-y-2 bg-muted/50">
                <Label>Offer Item #{index + 1}</Label>
                <div className="flex items-center gap-2 mb-2">
                    {index === 0 ? <Layers3 className="h-5 w-5 text-accent" /> : index === 1 ? <Sparkles className="h-5 w-5 text-accent" /> : <Users className="h-5 w-5 text-accent" />}
                    <span className="text-sm font-medium">Feature Card {index + 1}</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`offerItems[${index}].title`}>Title</Label>
                  <Input
                    id={`offerItems[${index}].title`}
                    name={`offerItems[${index}].title`}
                    value={item.title}
                    onChange={(e) => handleOfferItemChange(index, 'title', e.target.value)}
                  />
                  {state?.errors?.offerItems?.[index]?.title && <p className="text-sm text-destructive">{state.errors.offerItems[index].title.join(', ')}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`offerItems[${index}].description`}>Description</Label>
                  <Textarea
                    id={`offerItems[${index}].description`}
                    name={`offerItems[${index}].description`}
                    value={item.description}
                    onChange={(e) => handleOfferItemChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                   {state?.errors?.offerItems?.[index]?.description && <p className="text-sm text-destructive">{state.errors.offerItems[index].description.join(', ')}</p>}
                </div>
              </div>
            ))}
             {state?.errors?.offerItems && typeof state.errors.offerItems === 'string' && <p className="text-sm text-destructive">{state.errors.offerItems}</p>}

          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Join Our Universe Section</h3>
            <div className="space-y-2">
              <Label htmlFor="joinTitle">"Join Our Universe" Title</Label>
              <Input id="joinTitle" name="joinTitle" value={formData.joinTitle || ''} onChange={handleInputChange} />
              {state?.errors?.joinTitle && <p className="text-sm text-destructive">{state.errors.joinTitle.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinContent">Content Paragraph</Label>
              <Textarea id="joinContent" name="joinContent" value={formData.joinContent || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.joinContent && <p className="text-sm text-destructive">{state.errors.joinContent.join(', ')}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image2Url">Join Section Image URL</Label>
                  <Input id="image2Url" name="image2Url" value={formData.image2Url || ''} onChange={handleInputChange} placeholder="https://placehold.co/600x300.png"/>
                   {state?.errors?.image2Url && <p className="text-sm text-destructive">{state.errors.image2Url.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image2Alt">Join Section Image Alt Text</Label>
                  <Input id="image2Alt" name="image2Alt" value={formData.image2Alt || ''} onChange={handleInputChange} placeholder="Community of designers"/>
                  {state?.errors?.image2Alt && <p className="text-sm text-destructive">{state.errors.image2Alt.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image2DataAiHint">Join Section Image AI Hint</Label>
                  <Input id="image2DataAiHint" name="image2DataAiHint" value={formData.image2DataAiHint || ''} onChange={handleInputChange} placeholder="community digital"/>
                   {state?.errors?.image2DataAiHint && <p className="text-sm text-destructive">{state.errors.image2DataAiHint.join(', ')}</p>}
                </div>
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
