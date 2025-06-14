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
import { User, UploadCloud, Save } from 'lucide-react';

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
  // currentAvatarSource will hold the URL or Data URL for the image
  const [currentAvatarSource, setCurrentAvatarSource] = useState('');
  
  useEffect(() => {
    if (user) {
      if ('name' in user) setName(user.name || '');
      // Initialize with existing avatar or placeholder
      const initialAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
        ? user.avatarUrl
        : `https://placehold.co/128x128.png?text=${(user && 'name' in user ? user.name || 'U' : 'U').charAt(0)}`;
      setCurrentAvatarSource(initialAvatar);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, JPEG, or PNG image.',
          variant: 'destructive',
        });
        e.target.value = ''; // Reset file input
        return;
      }
      // Optional: Add file size validation here
      // const maxSize = 5 * 1024 * 1024; // 5MB
      // if (file.size > maxSize) { ... }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentAvatarSource(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If file selection is cleared, revert to original or placeholder
      const originalAvatar = (user && 'avatarUrl' in user && user.avatarUrl)
        ? user.avatarUrl
        : `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`;
      setCurrentAvatarSource(originalAvatar);
    }
  };

  if (!user || !('id' in user)) {
    return <p>Loading user data...</p>;
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Update Profile</CardTitle>
        <CardDescription>Keep your personal information up to date.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="userId" value={user.id} />
        {/* Hidden input to send the avatar URL (or Data URL) to the server */}
        <input type="hidden" name="avatarUrl" value={currentAvatarSource} />

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
              <Image 
                src={currentAvatarSource || `https://placehold.co/128x128.png?text=${name.charAt(0) || 'U'}`} 
                alt="Avatar Preview" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="profile avatar preview"
                key={currentAvatarSource} // Add key to force re-render on src change
              />
            </div>
            <div className="w-full space-y-2">
                <Label htmlFor="avatarFile">Upload New Avatar (JPG, PNG)</Label>
                <div className="relative">
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="avatarFile"
                        type="file" 
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        aria-describedby="avatarUrl-error" // Keep for error display from schema if needed, though schema is simpler now
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
