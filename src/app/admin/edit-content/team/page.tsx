
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { TeamMembersContent, TeamMember, UpdatePageContentFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Users2, UserCircle, Briefcase, ScrollText, UploadCloud, Github, Linkedin, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Team Members Content</>}
    </Button>
  );
}

interface TeamMemberFormProps {
  memberType: 'founder' | 'coFounder';
  memberData: Partial<TeamMember>;
  onInputChange: (memberType: 'founder' | 'coFounder', field: keyof TeamMember, value: string) => void;
  onFileChange: (memberType: 'founder' | 'coFounder', file: File | null) => void;
  imagePreviewUrl?: string | null;
  errors?: Partial<Record<keyof TeamMember, string[] | { imageFile?: string[] }>>;
}

function TeamMemberFormSection({ memberType, memberData, onInputChange, onFileChange, imagePreviewUrl, errors }: TeamMemberFormProps) {
  const title = memberType === 'founder' ? 'Founder Details' : 'Co-Founder Details';
  const imageFileError = errors?.imageUrl && typeof errors.imageUrl === 'object' && 'imageFile' in errors.imageUrl ? (errors.imageUrl as { imageFile?: string[] }).imageFile?.join(', ') : null;
  const imageUrlError = errors?.imageUrl && Array.isArray(errors.imageUrl) ? (errors.imageUrl as string[]).join(', ') : null;


  return (
    <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
      <h3 className="text-xl font-semibold font-headline text-primary">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.name`}>Name</Label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id={`${memberType}.name`} name={`${memberType}.name`} value={memberData.name || ''} onChange={(e) => onInputChange(memberType, 'name', e.target.value)} className="pl-10" />
          </div>
          {errors?.name && <p className="text-sm text-destructive">{(errors.name as string[]).join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.title`}>Title/Role</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id={`${memberType}.title`} name={`${memberType}.title`} value={memberData.title || ''} onChange={(e) => onInputChange(memberType, 'title', e.target.value)} className="pl-10" />
          </div>
          {errors?.title && <p className="text-sm text-destructive">{(errors.title as string[]).join(', ')}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${memberType}.bio`}>Biography</Label>
         <div className="relative">
            <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea id={`${memberType}.bio`} name={`${memberType}.bio`} value={memberData.bio || ''} onChange={(e) => onInputChange(memberType, 'bio', e.target.value)} rows={4} className="pl-10"/>
        </div>
        {errors?.bio && <p className="text-sm text-destructive">{(errors.bio as string[]).join(', ')}</p>}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label htmlFor={`${memberType}ImageFile`}>Profile Image (JPG, PNG, max 2MB)</Label>
        <div className="flex items-center gap-4">
          {imagePreviewUrl && (
            <Image
              src={imagePreviewUrl}
              alt={`${memberType} preview`}
              width={80}
              height={80}
              className="rounded-md border object-cover"
              data-ai-hint={`${memberType} avatar preview`}
            />
          )}
          <div className="relative flex-grow">
             <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`${memberType}ImageFile`}
              name={`${memberType}ImageFile`}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => onFileChange(memberType, e.target.files ? e.target.files[0] : null)}
              className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        </div>
        {/* Hidden input to carry over existing image URL if no new file is selected */}
        <input type="hidden" name={`${memberType}.imageUrl`} value={memberData.imageUrl || ''} />
        {imageFileError && <p className="text-sm text-destructive">{imageFileError}</p>}
        {imageUrlError && !imageFileError && <p className="text-sm text-destructive">{imageUrlError}</p>}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.imageAlt`}>Image Alt Text</Label>
          <Input id={`${memberType}.imageAlt`} name={`${memberType}.imageAlt`} value={memberData.imageAlt || ''} onChange={(e) => onInputChange(memberType, 'imageAlt', e.target.value)} placeholder="Photo of [Name]" />
          {errors?.imageAlt && <p className="text-sm text-destructive">{(errors.imageAlt as string[]).join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.imageDataAiHint`}>Image AI Hint</Label>
          <Input id={`${memberType}.imageDataAiHint`} name={`${memberType}.imageDataAiHint`} value={memberData.imageDataAiHint || ''} onChange={(e) => onInputChange(memberType, 'imageDataAiHint', e.target.value)} placeholder="e.g., professional portrait" />
          {errors?.imageDataAiHint && <p className="text-sm text-destructive">{(errors.imageDataAiHint as string[]).join(', ')}</p>}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2">
        <Label htmlFor={`${memberType}.githubUrl`}>GitHub URL</Label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id={`${memberType}.githubUrl`} name={`${memberType}.githubUrl`} type="url" value={memberData.githubUrl || ''} onChange={(e) => onInputChange(memberType, 'githubUrl', e.target.value)} placeholder="https://github.com/username" className="pl-10"/>
        </div>
        {errors?.githubUrl && <p className="text-sm text-destructive">{(errors.githubUrl as string[]).join(', ')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${memberType}.linkedinUrl`}>LinkedIn URL</Label>
         <div className="relative">
          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id={`${memberType}.linkedinUrl`} name={`${memberType}.linkedinUrl`} type="url" value={memberData.linkedinUrl || ''} onChange={(e) => onInputChange(memberType, 'linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/username" className="pl-10"/>
        </div>
        {errors?.linkedinUrl && <p className="text-sm text-destructive">{(errors.linkedinUrl as string[]).join(', ')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${memberType}.emailAddress`}>Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id={`${memberType}.emailAddress`} name={`${memberType}.emailAddress`} type="email" value={memberData.emailAddress || ''} onChange={(e) => onInputChange(memberType, 'emailAddress', e.target.value)} placeholder="name@example.com" className="pl-10"/>
        </div>
        {errors?.emailAddress && <p className="text-sm text-destructive">{(errors.emailAddress as string[]).join(', ')}</p>}
      </div>
    </section>
  );
}


export default function EditTeamMembersPage() {
  const { toast } = useToast();
  const [initialContent, setInitialContent] = useState<TeamMembersContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<TeamMembersContent>>({
    founder: {},
    coFounder: {}
  });

  // State for image previews
  const [founderPreview, setFounderPreview] = useState<string | null>(null);
  const [coFounderPreview, setCoFounderPreview] = useState<string | null>(null);

  // Store selected files separately as FormData doesn't directly reflect them for re-render
  const [founderFile, setFounderFile] = useState<File | null>(null);
  const [coFounderFile, setCoFounderFile] = useState<File | null>(null);

  const initialState: UpdatePageContentFormState<TeamMembersContent> = { message: null, errors: {}, success: false, content: null };
  const [state, formAction] = useActionState(
     (prevState: UpdatePageContentFormState<TeamMembersContent>, data: FormData) =>
      updatePageContentAction('teamMembers', data) as Promise<UpdatePageContentFormState<TeamMembersContent>>,
    initialState
  );

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getPageContentAction('teamMembers') as TeamMembersContent;
        setInitialContent(content);
        setFormData(content || { title: 'Meet Our Team', founder: {}, coFounder: {} });
        if (content?.founder?.imageUrl) setFounderPreview(content.founder.imageUrl);
        if (content?.coFounder?.imageUrl) setCoFounderPreview(content.coFounder.imageUrl);
      } catch (error) {
        toast({ title: "Error", description: "Could not load Team Members content.", variant: "destructive" });
        setFormData({ title: 'Meet Our Team', founder: {}, coFounder: {} });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, [toast]);

  const handleSectionTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleMemberInputChange = (memberType: 'founder' | 'coFounder', field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      [memberType]: {
        ...(prev[memberType] || {}),
        [field]: value
      }
    }));
  };
  
  const handleFileChange = (memberType: 'founder' | 'coFounder', file: File | null) => {
    if (memberType === 'founder') {
      setFounderFile(file);
      if (file) setFounderPreview(URL.createObjectURL(file));
      else setFounderPreview(initialContent?.founder?.imageUrl || null); // Revert to original if file cleared
    } else {
      setCoFounderFile(file);
      if (file) setCoFounderPreview(URL.createObjectURL(file));
      else setCoFounderPreview(initialContent?.coFounder?.imageUrl || null); // Revert
    }
  };

  const handleFormSubmit = (payload: FormData) => {
    // Append files if they exist
    if (founderFile) payload.set('founderImageFile', founderFile);
    else payload.delete('founderImageFile'); // Ensure it's not sent if null

    if (coFounderFile) payload.set('coFounderImageFile', coFounderFile);
    else payload.delete('coFounderImageFile');
    
    // Pass existing image URLs so server action can decide to keep them if no new file
    payload.set('founder.existingImageUrl', formData.founder?.imageUrl || '');
    payload.set('coFounder.existingImageUrl', formData.coFounder?.imageUrl || '');

    formAction(payload);
  };


  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.content) {
        setInitialContent(state.content as TeamMembersContent);
        setFormData(state.content as TeamMembersContent || { title: 'Meet Our Team', founder: {}, coFounder: {} });
        // Update previews with potentially new paths from server
        setFounderPreview((state.content as TeamMembersContent).founder?.imageUrl || null);
        setCoFounderPreview((state.content as TeamMembersContent).coFounder?.imageUrl || null);
        setFounderFile(null); // Clear file state
        setCoFounderFile(null);
      }
    }
  }, [state, toast]);

  if (isLoading || !initialContent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Users2 className="mr-3 h-8 w-8 animate-pulse" /> Edit Team Members Page</CardTitle>
          <CardDescription>Loading content...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users2 className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Edit Team Members Page</CardTitle>
        </div>
        <CardDescription>Modify the content displayed for your team members on the About Us page.</CardDescription>
      </CardHeader>
      <form action={handleFormSubmit}>
        <CardContent className="space-y-8">
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Section Title</h3>
            <div className="space-y-2">
              <Label htmlFor="teamMembers.title">Title for "Meet Our Team" Section</Label>
              <Input id="teamMembers.title" name="title" value={formData.title || 'Meet Our Team'} onChange={(e) => handleSectionTitleChange(e.target.value)} />
              {state?.errors?.title && <p className="text-sm text-destructive">{(state.errors.title as string[]).join(', ')}</p>}
            </div>
          </section>

          <TeamMemberFormSection
            memberType="founder"
            memberData={formData.founder || {}}
            onInputChange={handleMemberInputChange}
            onFileChange={handleFileChange}
            imagePreviewUrl={founderPreview}
            errors={state?.errors?.founder}
          />
          <TeamMemberFormSection
            memberType="coFounder"
            memberData={formData.coFounder || {}}
            onInputChange={handleMemberInputChange}
            onFileChange={handleFileChange}
            imagePreviewUrl={coFounderPreview}
            errors={state?.errors?.coFounder}
          />
          
          {state?.errors?.general && <p className="text-sm text-destructive p-4 text-center">{(state.errors.general as string[]).join(', ')}</p>}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
