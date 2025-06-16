
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateSiteLogoAction } from '@/lib/actions';
import type { SiteLogoUploadState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Image as ImageIcon, UploadCloud } from 'lucide-react';
import Image from 'next/image'; // For preview

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Uploading...' : <><Save className="mr-2 h-4 w-4" /> Upload & Save Logo</>}
    </Button>
  );
}

export default function EditSiteLogoPage() {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>('/site_logo.png');

  const initialState: SiteLogoUploadState = { message: null, errors: {}, success: false, filePath: null };
  const [state, formAction] = useActionState(updateSiteLogoAction, initialState);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Error", description: "File size exceeds 2MB limit.", variant: "destructive"});
        event.target.value = ""; 
        setPreview(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };
  
  useEffect(() => {
    const img = new window.Image();
    const checkSrc = '/site_logo.png?v=' + new Date().getTime(); // Cache bust for check
    img.src = checkSrc; 
    img.onload = () => setCurrentLogoPath(checkSrc); // Use cache-busted path for preview
    img.onerror = () => setCurrentLogoPath(null);
  }, [state?.success]);


  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.filePath) {
        setPreview(null); 
        const logoUploadForm = document.getElementById('logoUploadForm') as HTMLFormElement;
        if (logoUploadForm) {
            logoUploadForm.reset();
        }
        // Dispatch custom event to notify other components (like Header/Logo)
        window.dispatchEvent(new CustomEvent('logoUpdated'));
        // Update local preview path to reflect the new logo with a cache buster
        setCurrentLogoPath(state.filePath + '?' + new Date().getTime());
      }
    }
  }, [state, toast]);


  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Change Site Logo</CardTitle>
        </div>
        <CardDescription>Upload a new logo for your website. Recommended format: PNG with transparent background. Max size: 2MB.</CardDescription>
      </CardHeader>
      <form id="logoUploadForm" action={formAction}>
        <CardContent className="space-y-8">
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Current Logo</h3>
            {currentLogoPath ? (
              <Image 
                src={currentLogoPath} 
                alt="Current Site Logo" 
                width={160} height={32} 
                className="object-contain rounded border p-2 bg-muted/30" 
                key={currentLogoPath} 
                data-ai-hint="current logo"
              />
            ) : (
              <p className="text-muted-foreground">No custom logo uploaded. Default text logo is in use.</p>
            )}
          </section>

          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Upload New Logo</h3>
            <div className="space-y-2">
              <Label htmlFor="logoFile">Logo File (PNG, JPG, SVG, max 2MB)</Label>
              <div className="relative">
                 <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                    id="logoFile" 
                    name="logoFile" 
                    type="file" 
                    accept="image/png, image/jpeg, image/svg+xml" 
                    onChange={handleFileChange} 
                    className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                 />
              </div>
              {state?.errors?.logoFile && <p className="text-sm text-destructive">{state.errors.logoFile.join(', ')}</p>}
            </div>
            {preview && (
              <div className="mt-4">
                <Label>New Logo Preview:</Label>
                <div className="relative w-[160px] h-[32px] mt-2 rounded border p-1 bg-muted/30">
                  <Image 
                      src={preview} 
                      alt="New logo preview" 
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="logo preview"
                  />
                </div>
              </div>
            )}
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
