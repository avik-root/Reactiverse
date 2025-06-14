'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signupUser, type SignupFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing up...' : <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
    </Button>
  );
}

export default function SignupForm() {
  const initialState: SignupFormState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(signupUser, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.message) {
      if (state.user) { // Success
        toast({
          title: 'Signup Successful',
          description: state.message,
        });
        router.push('/auth/login'); // Redirect to login after successful signup
      } else { // Error
        toast({
          title: 'Signup Failed',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Create Designer Account</CardTitle>
          <CardDescription>Join Reactiverse and start showcasing your work.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="Your Name" required 
                aria-invalid={!!state?.errors?.name}
                aria-describedby="name-error"
              />
              {state?.errors?.name && <p id="name-error" className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
            </div>
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
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto text-accent">
                <Link href="/auth/login">Log in</Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
