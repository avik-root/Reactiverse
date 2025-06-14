
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { loginUser, type LoginFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, KeyRound, User } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

export default function LoginForm() {
  const initialState: LoginFormState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(loginUser, initialState);
  const { toast } = useToast();
  const { login: authLogin, user: authUser, isAdmin } = useAuth(); // Added isAdmin from useAuth
  const router = useRouter();

  useEffect(() => {
    if (state?.message && !state.user) {
      toast({
        title: 'Login Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
    if (state?.user) {
      authLogin(state.user, false); // false for isAdmin
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // Redirect to dashboard for regular users, keep admins (if they somehow use this form) going to /
      // However, admins have their own login page. So this path is primarily for regular users.
      router.push('/dashboard'); 
    }
  }, [state, toast, authLogin, router]);

  useEffect(() => {
    // If user is already logged in and is a regular user, redirect to dashboard
    // If user is already logged in and is an admin, they should use /admin/login, but if they land here, redirect to admin dashboard
    if (authUser) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [authUser, isAdmin, router]);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Designer Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="identifier" name="identifier" type="text" placeholder="@username or you@example.com" required className="pl-10"
                  aria-invalid={!!state?.errors?.identifier}
                  aria-describedby="identifier-error"
                />
              </div>
              {state?.errors?.identifier && <p id="identifier-error" className="text-sm text-destructive">{state.errors.identifier.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type="password" required className="pl-10"
                  aria-invalid={!!state?.errors?.password}
                  aria-describedby="password-error"
                />
              </div>
              {state?.errors?.password && <p id="password-error" className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
            </div>
            {state?.errors?.general && <p className="text-sm text-destructive">{state.errors.general.join(', ')}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto text-accent">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
