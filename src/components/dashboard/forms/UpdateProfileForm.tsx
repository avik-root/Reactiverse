
// src/components/dashboard/forms/UpdateProfileForm.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction, type UpdateProfileFormState } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { User, UploadCloud, Save, Github, Linkedin, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import FigmaIcon from '@/components/icons/FigmaIcon';

const MAX_AVATAR_SIZE_MB = 5;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving Profile...' : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
    </Button>
  );
}

export default function UpdateProfileForm() {
  const { user, updateAuthUser } = useAuth();
  const { toast } = useToast();

  const initialState: UpdateProfileFormState = { message: null, errors: {}, success: false, user: null };
  const [state, dispatch] = useActionState(updateProfileAction, initialState);

  const [name, setName] = useState('');
  const [currentAvatarSource, setCurrentAvatarSource] = useState(''); // For preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // To hold the selected file
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isEmailPublic, setIsEmailPublic] = useState(false);
  const [isPhonePublic, setIsPhonePublic] = useState(false);

  useEffect(() => {
    if (user) {
      if ('name' in user) setName(user.name || '');
      const initialAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
        ? user.avatarUrl
        : `https://placehold.co/128x128.png?text=${(user && 'name' in user ? user.name || 'U' : 'U').charAt(0)}`;
      setCurrentAvatarSource(initialAvatar);
      if ('githubUrl' in user) setGithubUrl(user.githubUrl || '');
      if ('linkedinUrl' in user) setLinkedinUrl(user.linkedinUrl || '');
      if ('figmaUrl' in user) setFigmaUrl(user.figmaUrl || '');
      if ('isEmailPublic' in user) setIsEmailPublic(user.isEmailPublic || false);
      if ('isPhonePublic' in user) setIsPhonePublic(user.isPhonePublic || false);
    }
  }, [user]);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.user) {
        updateAuthUser(state.user);
        if (state.user.avatarUrl) {
          setCurrentAvatarSource(state.user.avatarUrl); 
        }
        setAvatarFile(null); 
        const form = document.getElementById('updateProfileForm') as HTMLFormElement;
        if (form) {
            const fileInput = form.elements.namedItem('avatarFile') as HTMLInputElement;
            if (fileInput) fileInput.value = ""; 
        }

      }
    }
  }, [state, toast, updateAuthUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, JPEG, or PNG image.',
          variant: 'destructive',
        });
        e.target.value = ''; 
        setAvatarFile(null);
        const originalAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
          ? user.avatarUrl
          : `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`;
        setCurrentAvatarSource(originalAvatar);
        return;
      }
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
         toast({
          title: 'File Too Large',
          description: `Avatar image must be ${MAX_AVATAR_SIZE_MB}MB or less.`,
          variant: 'destructive',
        });
        e.target.value = '';
        setAvatarFile(null);
        const originalAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
          ? user.avatarUrl
          : `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`;
        setCurrentAvatarSource(originalAvatar);
        return;
      }

      setAvatarFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentAvatarSource(reader.result as string); 
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      const originalAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
        ? user.avatarUrl
        : `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`;
      setCurrentAvatarSource(originalAvatar);
    }
  };

  if (!user || !('id' in user)) {
    return <p>Loading user data...</p>;
  }

  const handleSubmit = (formData: FormData) => {
    if (avatarFile) {
      formData.set('avatarFile', avatarFile); 
    } else {
      formData.delete('avatarFile'); 
    }
    dispatch(formData);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Update Profile</CardTitle>
        <CardDescription>Keep your personal information and social links up to date.</CardDescription>
      </CardHeader>
      <form id="updateProfileForm" action={handleSubmit}>
        <input type="hidden" name="userId" value={user.id} />
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={currentAvatarSource || `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`}
                alt="Avatar Preview"
                layout="fill"
                objectFit="cover"
                data-ai-hint="profile avatar preview"
                key={currentAvatarSource} 
              />
            </div>
            <div className="w-full space-y-2">
                <Label htmlFor="avatarFile">Upload New Avatar (JPG, PNG, max 5MB)</Label>
                <div className="relative">
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="avatarFile"
                        name="avatarFile" 
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        aria-describedby="avatarFile-error" 
                    />
                </div>
                 {state?.errors?.avatarFile && <p id="avatarFile-error" className="text-sm text-destructive">{state.errors.avatarFile.join(', ')}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    aria-describedby="name-error"
                />
            </div>
            {state?.errors?.name && <p id="name-error" className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Profile URL</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/yourusername" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="pl-10" aria-describedby="githubUrl-error"/>
            </div>
            {state?.errors?.githubUrl && <p id="githubUrl-error" className="text-sm text-destructive">{state.errors.githubUrl.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/yourusername" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="pl-10" aria-describedby="linkedinUrl-error"/>
            </div>
            {state?.errors?.linkedinUrl && <p id="linkedinUrl-error" className="text-sm text-destructive">{state.errors.linkedinUrl.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="figmaUrl">Figma Profile/Community URL</Label>
            <div className="relative">
              <FigmaIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="figmaUrl" name="figmaUrl" type="url" placeholder="https://figma.com/@yourusername" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} className="pl-10" aria-describedby="figmaUrl-error"/>
            </div>
            {state?.errors?.figmaUrl && <p id="figmaUrl-error" className="text-sm text-destructive">{state.errors.figmaUrl.join(', ')}</p>}
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium text-primary">Privacy Settings</h3>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="isEmailPublic" className="text-base">Make Email Public</Label>
                <p className="text-xs text-muted-foreground">Allow other users to see your email on your profile card.</p>
              </div>
              <Switch
                id="isEmailPublic"
                name="isEmailPublic"
                checked={isEmailPublic}
                onCheckedChange={setIsEmailPublic}
                aria-label="Toggle email visibility"
              />
            </div>
            {state?.errors?.isEmailPublic && <p className="text-sm text-destructive">{state.errors.isEmailPublic.join(', ')}</p>}

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="isPhonePublic" className="text-base">Make Phone Public</Label>
                <p className="text-xs text-muted-foreground">
                  Allow other users to see your phone number. (Note: Phone numbers are generally not shown on public cards).
                </p>
              </div>
              <Switch
                id="isPhonePublic"
                name="isPhonePublic"
                checked={isPhonePublic}
                onCheckedChange={setIsPhonePublic}
                aria-label="Toggle phone visibility"
              />
            </div>
            {state?.errors?.isPhonePublic && <p className="text-sm text-destructive">{state.errors.isPhonePublic.join(', ')}</p>}
          </div>


          <div className="space-y-2">
            <Label htmlFor="email">Email (cannot be changed for login)</Label>
            <Input id="email" name="email_display" type="email" value={user.email || ''} readOnly disabled className="bg-muted/50"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (cannot be changed for login)</Label>
            <Input id="phone" name="phone_display" type="tel" value={user.phone || ''} readOnly disabled className="bg-muted/50"/>
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

