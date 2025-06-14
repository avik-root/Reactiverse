// src/components/dashboard/forms/ChangePasswordForm.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { changePasswordAction, type ChangePasswordFormState } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Updating Password...' : <><ShieldCheck className="mr-2 h-4 w-4" /> Update Password</>}
    </Button>
  );
}

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const initialState: ChangePasswordFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        // Form can be reset here if needed by managing input values with useState
        // For example, by finding the form element and calling reset()
        // document.getElementById('changePasswordForm')?.reset(); // This is a simple way
      }
    }
  }, [state, toast]);

  if (!user || !('id' in user)) {
    return <p>Loading user data...</p>;
  }

  return (
    <Card className="w-full shadow-xl mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Change Password</CardTitle>
        <CardDescription>Update your account password for better security.</CardDescription>
      </CardHeader>
      <form id="changePasswordForm" action={dispatch}>
        <input type="hidden" name="userId" value={user.id} />
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    required 
                    className="pl-10"
                    aria-describedby="currentPassword-error"
                />
            </div>
            {state?.errors?.currentPassword && <p id="currentPassword-error" className="text-sm text-destructive">{state.errors.currentPassword.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
             <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    required 
                    className="pl-10"
                    aria-describedby="newPassword-error"
                />
            </div>
            {state?.errors?.newPassword && <p id="newPassword-error" className="text-sm text-destructive">{state.errors.newPassword.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    className="pl-10"
                    aria-describedby="confirmPassword-error"
                />
            </div>
            {state?.errors?.confirmPassword && <p id="confirmPassword-error" className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
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
