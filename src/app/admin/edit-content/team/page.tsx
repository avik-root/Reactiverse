
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
  existingImageUrl?: string | null;
  errors?: Partial<Record<keyof TeamMember, string[] | { imageFile?: string[] }>>;
}

function TeamMemberFormSection({ memberType, memberData, onInputChange, onFileChange, imagePreviewUrl, existingImageUrl, errors }: TeamMemberFormProps) {
  const title = memberType === 'founder' ? 'Founder Details' : 'Co-Founder Details';
  
  const imageFileErrorKey = `${memberType}ImageFile` as keyof UpdatePageContentFormState<TeamMembersContent>['errors'];
  const imageFileError = errors && (errors as any)[imageFileErrorKey] ? ((errors as any)[imageFileErrorKey] as string[]).join(', ') : null;

  const { toast } = useToast();

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Error", description: "File size exceeds 5MB limit.", variant: "destructive"});
        e.target.value = ""; 
        onFileChange(memberType, null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast({ title: "Error", description: "Invalid file type. Please use JPG or PNG.", variant: "destructive"});
        e.target.value = "";
        onFileChange(memberType, null);
        return;
      }
      onFileChange(memberType, file);
    } else {
      onFileChange(memberType, null);
    }
  };


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
        <Label htmlFor={`${memberType}ImageFile`}>Profile Image (JPG, PNG, max 5MB)</Label>
        <div className="flex items-center gap-4">
          {(imagePreviewUrl || existingImageUrl) && (
            <Image
              src={imagePreviewUrl || existingImageUrl!}
              alt={`${memberType} preview`}
              width={80}
              height={80}
              className="rounded-md border object-cover"
              data-ai-hint={`${memberType} avatar preview`}
              key={imagePreviewUrl || existingImageUrl} 
            />
          )}
          <div className="relative flex-grow">
             <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`${memberType}ImageFile`}
              name={`${memberType}ImageFile`}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleLocalFileChange}
              className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        </div>
        <input type="hidden" name={`${memberType}.existingImageUrl`} value={memberData.imageUrl || ''} />
        {imageFileError && <p className="text-sm text-destructive">{imageFileError}</p>}
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

  const [founderPreview, setFounderPreview] = useState<string | null>(null);
  const [coFounderPreview, setCoFounderPreview] = useState<string | null>(null);
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
      setFounderPreview(file ? URL.createObjectURL(file) : initialContent?.founder?.imageUrl || null);
    } else {
      setCoFounderFile(file);
      setCoFounderPreview(file ? URL.createObjectURL(file) : initialContent?.coFounder?.imageUrl || null);
    }
  };

  const handleFormSubmit = (payload: FormData) => {
    if (founderFile) payload.set('founderImageFile', founderFile);
    else payload.delete('founderImageFile');
    payload.set('founder.existingImageUrl', initialContent?.founder?.imageUrl || '');


    if (coFounderFile) payload.set('coFounderImageFile', coFounderFile);
    else payload.delete('coFounderImageFile');
    payload.set('coFounder.existingImageUrl', initialContent?.coFounder?.imageUrl || '');
    
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
        const updatedContent = state.content as TeamMembersContent;
        setInitialContent(updatedContent);
        setFormData(updatedContent || { title: 'Meet Our Team', founder: {}, coFounder: {} });
        setFounderPreview(updatedContent.founder?.imageUrl || null);
        setCoFounderPreview(updatedContent.coFounder?.imageUrl || null);
        setFounderFile(null);
        setCoFounderFile(null);

        const formElement = document.getElementById('editTeamMembersForm') as HTMLFormElement;
        if (formElement) {
            const founderInput = formElement.elements.namedItem('founderImageFile') as HTMLInputElement;
            if (founderInput) founderInput.value = "";
            const coFounderInput = formElement.elements.namedItem('coFounderImageFile') as HTMLInputElement;
            if (coFounderInput) coFounderInput.value = "";
        }
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
      <form id="editTeamMembersForm" action={handleFormSubmit}>
        <CardContent className="space-y-8">
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Section Title</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Title for "Meet Our Team" Section</Label>
              <Input id="title" name="title" value={formData.title || 'Meet Our Team'} onChange={(e) => handleSectionTitleChange(e.target.value)} />
              {state?.errors?.title && <p className="text-sm text-destructive">{(state.errors.title as string[]).join(', ')}</p>}
            </div>
          </section>

          <TeamMemberFormSection
            memberType="founder"
            memberData={formData.founder || {}}
            onInputChange={handleMemberInputChange}
            onFileChange={handleFileChange}
            imagePreviewUrl={founderPreview}
            existingImageUrl={initialContent.founder?.imageUrl}
            errors={state?.errors?.founder as any}
          />
          <TeamMemberFormSection
            memberType="coFounder"
            memberData={formData.coFounder || {}}
            onInputChange={handleMemberInputChange}
            onFileChange={handleFileChange}
            imagePreviewUrl={coFounderPreview}
            existingImageUrl={initialContent.coFounder?.imageUrl}
            errors={state?.errors?.coFounder as any}
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
