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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { User, Image as ImageIcon, Save } from 'lucide-react';

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

  const [name, setName] = useState(user && 'name' in user ? user.name || '' : '');
  const [avatarUrl, setAvatarUrl] = useState(user && 'avatarUrl' in user ? user.avatarUrl || '' : '');
  const [avatarPreview, setAvatarPreview] = useState(user && 'avatarUrl' in user ? user.avatarUrl || '' : `https://placehold.co/128x128.png?text=${name.charAt(0)}`);
  
  useEffect(() => {
    if (user) {
      if ('name' in user) setName(user.name || '');
      if ('avatarUrl' in user) {
        setAvatarUrl(user.avatarUrl || '');
        setAvatarPreview(user.avatarUrl || `https://placehold.co/128x128.png?text=${(user.name || 'U').charAt(0)}`);
      }
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
        updateAuthUser(state.user); // Update user in AuthContext
      }
    }
  }, [state, toast, updateAuthUser]);

  if (!user || !('id' in user)) {
    return <p>Loading user data...</p>;
  }

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image'))) {
      setAvatarPreview(url);
    } else {
      setAvatarPreview(`https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`);
    }
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Update Profile</CardTitle>
        <CardDescription>Keep your personal information up to date.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="userId" value={user.id} />
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
              <Image 
                src={avatarPreview || `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`} 
                alt="Avatar Preview" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="profile avatar"
              />
            </div>
            <div className="w-full space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="avatarUrl" 
                        name="avatarUrl" 
                        type="url" 
                        placeholder="https://example.com/avatar.png" 
                        value={avatarUrl}
                        onChange={handleAvatarUrlChange}
                        className="pl-10"
                        aria-describedby="avatarUrl-error"
                    />
                </div>
                 {state?.errors?.avatarUrl && <p id="avatarUrl-error" className="text-sm text-destructive">{state.errors.avatarUrl.join(', ')}</p>}
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

          {/* Email is typically not changed by user directly or requires verification */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (cannot be changed)</Label>
            <Input id="email" name="email" type="email" value={user.email || ''} readOnly disabled className="bg-muted/50"/>
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
