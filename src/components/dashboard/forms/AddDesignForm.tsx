// src/components/dashboard/forms/AddDesignForm.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitDesignAction, type AddDesignFormState } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DollarSign, UploadCloud, Tag } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Submitting Design...' : <><UploadCloud className="mr-2 h-4 w-4" /> Submit Design</>}
    </Button>
  );
}

export default function AddDesignForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialState: AddDesignFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(submitDesignAction, initialState);

  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        // Optionally reset form or redirect
        // e.g., router.push('/dashboard/designs');
        // For now, just clear preview
        setImageUrlPreview(null); 
        // A full form reset would require managing form fields with useState
      }
    }
  }, [state, toast, router]);

  if (!user || !('id' in user)) {
    return <p>You must be logged in to submit a design.</p>;
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Basic URL validation for preview, server will do more robust validation
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image'))) {
      setImageUrlPreview(url);
    } else {
      setImageUrlPreview(null);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Submit a New Design</CardTitle>
        <CardDescription>Share your creative component with the Reactiverse community.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="submittedByUserId" value={user.id} />
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Design Title</Label>
            <Input id="title" name="title" type="text" placeholder="e.g., Animated Gradient Button" required aria-describedby="title-error"/>
            {state?.errors?.title && <p id="title-error" className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your design, its features, and usage." required  aria-describedby="description-error"/>
            {state?.errors?.description && <p id="description-error" className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://placehold.co/600x400.png" required onChange={handleImageUrlChange} aria-describedby="imageUrl-error"/>
            {state?.errors?.imageUrl && <p id="imageUrl-error" className="text-sm text-destructive">{state.errors.imageUrl.join(', ')}</p>}
            {imageUrlPreview && (
              <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden border">
                <Image src={imageUrlPreview} alt="Design preview" layout="fill" objectFit="contain" data-ai-hint="design preview user upload" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="htmlCode">HTML Code</Label>
              <Textarea id="htmlCode" name="htmlCode" placeholder="<div>Your HTML here</div>" rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cssCode">CSS Code</Label>
              <Textarea id="cssCode" name="cssCode" placeholder=".your-class { color: red; }" rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jsCode">JavaScript Code</Label>
              <Textarea id="jsCode" name="jsCode" placeholder="console.log('Hello');" rows={5} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="tags" name="tags" type="text" placeholder="e.g., button, animation, dark-theme" required className="pl-10" aria-describedby="tags-error"/>
            </div>
            {state?.errors?.tags && <p id="tags-error" className="text-sm text-destructive">{state.errors.tags.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) - Enter 0 for free</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="price" name="price" type="number" placeholder="0.00" step="0.01" min="0" defaultValue="0" required className="pl-10" aria-describedby="price-error"/>
            </div>
            {state?.errors?.price && <p id="price-error" className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
          </div>

          {state?.errors?.general && <p className="text-sm text-destructive">{state.errors.general.join(', ')}</p>}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
