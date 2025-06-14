
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateAdminProfileAction, type UpdateAdminProfileFormState } from '@/lib/actions';
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

export default function UpdateAdminProfileForm() {
  const { user: adminUser, updateAuthUser } = useAuth(); // Assuming 'user' in AuthContext is the admin when isAdmin is true
  const { toast } = useToast();

  const initialState: UpdateAdminProfileFormState = { message: null, errors: {}, success: false, adminUser: null };
  const [state, dispatch] = useActionState(updateAdminProfileAction, initialState);

  const [name, setName] = useState('');
  const [currentAvatarSource, setCurrentAvatarSource] = useState('');
  
  useEffect(() => {
    if (adminUser && adminUser.isAdmin) {
      setName(adminUser.name || '');
      const initialAvatar = adminUser.avatarUrl || `https://placehold.co/128x128.png?text=${(adminUser.name || 'A').charAt(0)}`;
      setCurrentAvatarSource(initialAvatar);
    }
  }, [adminUser]);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.adminUser) {
        // Update user in AuthContext. Make sure the structure matches what AuthContext expects for an admin.
        updateAuthUser(prev => ({...prev, ...state.adminUser, isAdmin: true}));
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
        e.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentAvatarSource(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const originalAvatar = (adminUser && adminUser.isAdmin && adminUser.avatarUrl)
        ? adminUser.avatarUrl
        : `https://placehold.co/128x128.png?text=${name.charAt(0) || 'A'}`;
      setCurrentAvatarSource(originalAvatar);
    }
  };

  if (!adminUser || !adminUser.isAdmin) {
    return <p>Loading admin data or not authorized...</p>;
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Update Admin Profile</CardTitle>
        <CardDescription>Keep your personal information up to date.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <input type="hidden" name="adminId" value={adminUser.id} />
        <input type="hidden" name="avatarUrl" value={currentAvatarSource} />

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
              <Image 
                src={currentAvatarSource || `https://placehold.co/128x128.png?text=${name.charAt(0) || 'A'}`} 
                alt="Avatar Preview" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="admin avatar preview"
                key={currentAvatarSource}
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

          <div className="space-y-2">
            <Label htmlFor="email">Email (cannot be changed)</Label>
            <Input id="email" name="email" type="email" value={adminUser.email || ''} readOnly disabled className="bg-muted/50"/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="username">Username (cannot be changed)</Label>
            <Input id="username" name="username" type="text" value={adminUser.username || ''} readOnly disabled className="bg-muted/50"/>
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
