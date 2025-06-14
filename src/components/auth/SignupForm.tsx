
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signupUser, type SignupFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, AtSign, Phone, KeyRound, UserSquare2 } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

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
  const [state, dispatch] = useActionState(signupUser, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (state?.message) {
      if (state.user) { // Success
        toast({
          title: 'Signup Successful',
          description: state.message,
        });
        router.push('/auth/login'); 
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
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Create Designer Account</CardTitle>
          <CardDescription>Join Reactiverse and start showcasing your work.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserSquare2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" name="name" type="text" placeholder="Your Full Name" required className="pl-10"
                    aria-invalid={!!state?.errors?.name}
                    aria-describedby="name-error"
                  />
                </div>
                {state?.errors?.name && <p id="name-error" className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                 <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="username" name="username" type="text" placeholder="@yourusername" required  className="pl-10"
                    aria-invalid={!!state?.errors?.username}
                    aria-describedby="username-error"
                  />
                </div>
                {state?.errors?.username && <p id="username-error" className="text-sm text-destructive">{state.errors.username.join(', ')}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="pl-10"
                  aria-invalid={!!state?.errors?.email}
                  aria-describedby="email-error"
                />
              </div>
              {state?.errors?.email && <p id="email-error" className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (with country code)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required className="pl-10"
                  aria-invalid={!!state?.errors?.phone}
                  aria-describedby="phone-error"
                />
              </div>
              {state?.errors?.phone && <p id="phone-error" className="text-sm text-destructive">{state.errors.phone.join(', ')}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type="password" required className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!state?.errors?.password}
                  aria-describedby="password-error"
                />
              </div>
              <PasswordStrengthMeter password={password} />
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
