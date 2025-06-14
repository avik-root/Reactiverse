'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginUser, type LoginFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect }
from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

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
  const [state, dispatch] = useFormState(loginUser, initialState);
  const { toast } = useToast();
  const { login: authLogin, user: authUser } = useAuth();
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
      // Redirect after successful login
      router.push('/'); 
    }
  }, [state, toast, authLogin, router]);

  useEffect(() => {
    if (authUser) {
      router.push('/');
    }
  }, [authUser, router]);

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
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required 
                aria-invalid={!!state?.errors?.email}
                aria-describedby="email-error"
              />
              {state?.errors?.email && <p id="email-error" className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required 
                aria-invalid={!!state?.errors?.password}
                aria-describedby="password-error"
              />
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
