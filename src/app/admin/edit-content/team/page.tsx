
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getPageContentAction, updatePageContentAction } from '@/lib/actions';
import type { TeamMembersContent, TeamMember, UpdatePageContentFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Users2, UserCircle, Briefcase, ScrollText, Image as ImageIcon } from 'lucide-react';
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
  errors?: Partial<Record<keyof TeamMember, string[]>>;
}

function TeamMemberFormSection({ memberType, memberData, onInputChange, errors }: TeamMemberFormProps) {
  const title = memberType === 'founder' ? 'Founder Details' : 'Co-Founder Details';
  
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
          {errors?.name && <p className="text-sm text-destructive">{errors.name.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.title`}>Title/Role</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id={`${memberType}.title`} name={`${memberType}.title`} value={memberData.title || ''} onChange={(e) => onInputChange(memberType, 'title', e.target.value)} className="pl-10" />
          </div>
          {errors?.title && <p className="text-sm text-destructive">{errors.title.join(', ')}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${memberType}.bio`}>Biography</Label>
         <div className="relative">
            <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea id={`${memberType}.bio`} name={`${memberType}.bio`} value={memberData.bio || ''} onChange={(e) => onInputChange(memberType, 'bio', e.target.value)} rows={4} className="pl-10"/>
        </div>
        {errors?.bio && <p className="text-sm text-destructive">{errors.bio.join(', ')}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.imageUrl`}>Image URL</Label>
           <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id={`${memberType}.imageUrl`} name={`${memberType}.imageUrl`} value={memberData.imageUrl || ''} onChange={(e) => onInputChange(memberType, 'imageUrl', e.target.value)} placeholder="https://placehold.co/300x300.png" className="pl-10"/>
            </div>
          {errors?.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.imageAlt`}>Image Alt Text</Label>
          <Input id={`${memberType}.imageAlt`} name={`${memberType}.imageAlt`} value={memberData.imageAlt || ''} onChange={(e) => onInputChange(memberType, 'imageAlt', e.target.value)} placeholder="Photo of [Name]" />
          {errors?.imageAlt && <p className="text-sm text-destructive">{errors.imageAlt.join(', ')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${memberType}.imageDataAiHint`}>Image AI Hint</Label>
          <Input id={`${memberType}.imageDataAiHint`} name={`${memberType}.imageDataAiHint`} value={memberData.imageDataAiHint || ''} onChange={(e) => onInputChange(memberType, 'imageDataAiHint', e.target.value)} placeholder="e.g., professional portrait" />
          {errors?.imageDataAiHint && <p className="text-sm text-destructive">{errors.imageDataAiHint.join(', ')}</p>}
        </div>
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
      <form action={formAction}>
        <CardContent className="space-y-8">
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline text-primary">Section Title</h3>
            <div className="space-y-2">
              <Label htmlFor="teamMembers.title">Title for "Meet Our Team" Section</Label>
              <Input id="teamMembers.title" name="title" value={formData.title || 'Meet Our Team'} onChange={(e) => handleSectionTitleChange(e.target.value)} />
              {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
            </div>
          </section>

          <TeamMemberFormSection
            memberType="founder"
            memberData={formData.founder || {}}
            onInputChange={handleMemberInputChange}
            errors={state?.errors?.founder}
          />
          <TeamMemberFormSection
            memberType="coFounder"
            memberData={formData.coFounder || {}}
            onInputChange={handleMemberInputChange}
            errors={state?.errors?.coFounder}
          />
          
          {state?.errors?.general && <p className="text-sm text-destructive p-4 text-center">{state.errors.general.join(', ')}</p>}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
