

'use client';

import { useActionState, useState } from 'react'; // Added useState
import { useFormStatus } from 'react-dom';
import { loginAdmin, type AdminLoginFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Eye, EyeOff, KeyRound } from 'lucide-react'; // Added Eye, EyeOff, KeyRound

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verifying...' : <><ShieldAlert className="mr-2 h-4 w-4" /> Admin Login</>}
    </Button>
  );
}

export default function AdminLoginForm() {
  const initialState: AdminLoginFormState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(loginAdmin, initialState);
  const { toast } = useToast();
  const { login: authLogin, user: authUser, isAdmin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  useEffect(() => {
    if (state?.message && !state.adminUser) {
      toast({
        title: 'Admin Login Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
    if (state?.adminUser) {
      authLogin(state.adminUser, true); // true for isAdmin
      toast({
        title: 'Admin Login Successful',
        description: 'Redirecting to dashboard...',
      });
    }
  }, [state, toast, authLogin]);

  useEffect(() => {
    if (authUser && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [authUser, isAdmin, router]);


  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Admin Access</CardTitle>
          <CardDescription>Enter administrator credentials.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="admin_user" required 
                aria-invalid={!!state?.errors?.username}
                aria-describedby="username-error"
              />
              {state?.errors?.username && <p id="username-error" className="text-sm text-destructive">{state.errors.username.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="pl-10 pr-10"
                  aria-invalid={!!state?.errors?.password}
                  aria-describedby="password-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {state?.errors?.password && <p id="password-error" className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
            </div>
            {state?.errors?.general && <p className="text-sm text-destructive">{state.errors.general.join(', ')}</p>}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
