
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
import { Save, Info, Layers3, Sparkles, Users, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

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
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);


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
        if (content?.image1Url) setImage1Preview(content.image1Url);
        if (content?.image2Url) setImage2Preview(content.image2Url);
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageSetter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>, originalUrl?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Error", description: "File size exceeds 5MB limit.", variant: "destructive"});
        e.target.value = ""; 
        imageSetter(null);
        previewSetter(originalUrl || null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast({ title: "Error", description: "Invalid file type. Please use JPG or PNG.", variant: "destructive"});
        e.target.value = "";
        imageSetter(null);
        previewSetter(originalUrl || null);
        return;
      }
      imageSetter(file);
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      imageSetter(null);
      previewSetter(originalUrl || null);
    }
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
        const updatedContent = state.content as AboutUsContent;
        setInitialContent(updatedContent);
        setFormData(updatedContent || { offerItems: [] });
        setImage1Preview(updatedContent.image1Url || null);
        setImage2Preview(updatedContent.image2Url || null);
        setImage1File(null);
        setImage2File(null);
        // Reset file inputs
        const formElement = document.getElementById('editAboutUsForm') as HTMLFormElement;
        if (formElement) {
            const image1Input = formElement.elements.namedItem('image1File') as HTMLInputElement;
            if (image1Input) image1Input.value = "";
            const image2Input = formElement.elements.namedItem('image2File') as HTMLInputElement;
            if (image2Input) image2Input.value = "";
        }
      }
    }
  }, [state, toast]);

  const handleFormAction = (payload: FormData) => {
    if (image1File) payload.set('image1File', image1File);
    else payload.delete('image1File');
    payload.set('existingImage1Url', initialContent?.image1Url || '');

    if (image2File) payload.set('image2File', image2File);
    else payload.delete('image2File');
    payload.set('existingImage2Url', initialContent?.image2Url || '');

    formAction(payload);
  };

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
      <form id="editAboutUsForm" action={handleFormAction}>
        <input type="hidden" name="existingImage1Url" value={initialContent?.image1Url || ""} />
        <input type="hidden" name="existingImage2Url" value={initialContent?.image2Url || ""} />
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
            <h3 className="text-xl font-semibold font-headline text-primary">Mission Section</h3>
            <div className="space-y-2">
              <Label htmlFor="missionTitle">Mission Title</Label>
              <Input id="missionTitle" name="missionTitle" value={formData.missionTitle || ''} onChange={handleInputChange} />
              {state?.errors?.missionTitle && <p className="text-sm text-destructive">{(state.errors.missionTitle as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionContentP1">Mission Content Paragraph 1</Label>
              <Textarea id="missionContentP1" name="missionContentP1" value={formData.missionContentP1 || ''} onChange={handleInputChange} rows={4}/>
              {state?.errors?.missionContentP1 && <p className="text-sm text-destructive">{(state.errors.missionContentP1 as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="missionContentP2">Mission Content Paragraph 2</Label>
              <Textarea id="missionContentP2" name="missionContentP2" value={formData.missionContentP2 || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.missionContentP2 && <p className="text-sm text-destructive">{(state.errors.missionContentP2 as string[]).join(', ')}</p>}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <Label htmlFor="image1File">Mission Image (JPG/PNG, max 5MB)</Label>
                  <div className="relative mt-1">
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="image1File" name="image1File" type="file" accept="image/jpeg,image/png" onChange={(e) => handleImageFileChange(e, setImage1File, setImage1Preview, initialContent?.image1Url)} className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                  </div>
                  {state?.errors?.image1File && <p className="text-sm text-destructive">{(state.errors.image1File as string[]).join(', ')}</p>}
                  {image1Preview && (
                    <div className="mt-2 relative w-full h-48 rounded border overflow-hidden">
                      <Image src={image1Preview} alt="Mission image preview" layout="fill" objectFit="contain" data-ai-hint="mission preview"/>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image1Alt">Mission Image Alt Text</Label>
                  <Input id="image1Alt" name="image1Alt" value={formData.image1Alt || ''} onChange={handleInputChange} placeholder="Collaborative design process"/>
                  {state?.errors?.image1Alt && <p className="text-sm text-destructive">{(state.errors.image1Alt as string[]).join(', ')}</p>}
                  <Label htmlFor="image1DataAiHint">Mission Image AI Hint</Label>
                  <Input id="image1DataAiHint" name="image1DataAiHint" value={formData.image1DataAiHint || ''} onChange={handleInputChange} placeholder="collaboration team"/>
                  {state?.errors?.image1DataAiHint && <p className="text-sm text-destructive">{(state.errors.image1DataAiHint as string[]).join(', ')}</p>}
                </div>
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">What We Offer Section</h3>
            <div className="space-y-2">
              <Label htmlFor="offerTitle">"What We Offer" Title</Label>
              <Input id="offerTitle" name="offerTitle" value={formData.offerTitle || ''} onChange={handleInputChange} />
              {state?.errors?.offerTitle && <p className="text-sm text-destructive">{(state.errors.offerTitle as string[]).join(', ')}</p>}
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
                  {state?.errors?.offerItems?.[index]?.title && <p className="text-sm text-destructive">{(state.errors.offerItems[index] as any).title.join(', ')}</p>}
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
                   {state?.errors?.offerItems?.[index]?.description && <p className="text-sm text-destructive">{(state.errors.offerItems[index] as any).description.join(', ')}</p>}
                </div>
              </div>
            ))}
             {state?.errors?.offerItems && typeof state.errors.offerItems === 'string' && <p className="text-sm text-destructive">{state.errors.offerItems as string}</p>}

          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Join Our Universe Section</h3>
            <div className="space-y-2">
              <Label htmlFor="joinTitle">"Join Our Universe" Title</Label>
              <Input id="joinTitle" name="joinTitle" value={formData.joinTitle || ''} onChange={handleInputChange} />
              {state?.errors?.joinTitle && <p className="text-sm text-destructive">{(state.errors.joinTitle as string[]).join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinContent">Content Paragraph</Label>
              <Textarea id="joinContent" name="joinContent" value={formData.joinContent || ''} onChange={handleInputChange} rows={3}/>
              {state?.errors?.joinContent && <p className="text-sm text-destructive">{(state.errors.joinContent as string[]).join(', ')}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <Label htmlFor="image2File">Join Section Image (JPG/PNG, max 5MB)</Label>
                  <div className="relative mt-1">
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="image2File" name="image2File" type="file" accept="image/jpeg,image/png" onChange={(e) => handleImageFileChange(e, setImage2File, setImage2Preview, initialContent?.image2Url)} className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                  </div>
                  {state?.errors?.image2File && <p className="text-sm text-destructive">{(state.errors.image2File as string[]).join(', ')}</p>}
                  {image2Preview && (
                     <div className="mt-2 relative w-full h-40 rounded border overflow-hidden">
                       <Image src={image2Preview} alt="Join section image preview" layout="fill" objectFit="contain" data-ai-hint="join preview"/>
                     </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image2Alt">Join Section Image Alt Text</Label>
                  <Input id="image2Alt" name="image2Alt" value={formData.image2Alt || ''} onChange={handleInputChange} placeholder="Community of designers"/>
                  {state?.errors?.image2Alt && <p className="text-sm text-destructive">{(state.errors.image2Alt as string[]).join(', ')}</p>}
                  <Label htmlFor="image2DataAiHint">Join Section Image AI Hint</Label>
                  <Input id="image2DataAiHint" name="image2DataAiHint" value={formData.image2DataAiHint || ''} onChange={handleInputChange} placeholder="community digital"/>
                   {state?.errors?.image2DataAiHint && <p className="text-sm text-destructive">{(state.errors.image2DataAiHint as string[]).join(', ')}</p>}
                </div>
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
