
'use client';

import { useActionState, useEffect, useState } from 'react';
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
import { LogIn, KeyRound, User, ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';

function SubmitButton({ isPinStage }: { isPinStage: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isPinStage ? 'Verifying PIN...' : 'Logging in...') :
        isPinStage ? <><ShieldCheck className="mr-2 h-4 w-4" /> Verify PIN</> : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

export default function LoginForm() {
  const initialState: LoginFormState = { message: null, errors: {}, requiresPin: false, accountLocked: false };
  const [state, dispatch] = useActionState(loginUser, initialState);
  const { toast } = useToast();
  const { login: authLogin, user: authUser, isAdmin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false); // For show/hide PIN

  const [userIdForPin, setUserIdForPin] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (state?.message) {
      if (state.accountLocked) {
        toast({
          title: 'Account Locked',
          description: state.message || 'Your account is locked due to too many failed 2FA attempts. Please contact support.',
          variant: 'destructive',
          duration: 10000, // Longer duration for important messages
        });
        setUserIdForPin(undefined); // Clear PIN stage if locked
      } else if (state.user) { // Successful login
        authLogin(state.user, false); // false for isAdmin
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        router.push('/dashboard');
      } else if (state.requiresPin && state.userIdForPin) {
        setUserIdForPin(state.userIdForPin);
        toast({
          title: '2FA Required',
          description: state.message || 'Please enter your 6-digit PIN.',
          variant: 'default'
        });
      } else if (!state.requiresPin) { // Login failed before PIN stage (username/password)
        toast({
          title: 'Login Failed',
          description: state.message || 'An error occurred.',
          variant: 'destructive',
        });
        setUserIdForPin(undefined);
      } else if (state.requiresPin && !state.user) { // PIN verification failed but not locked yet
         toast({
          title: 'PIN Verification Failed',
          description: state.message || 'Incorrect PIN.',
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, authLogin, router]);

  useEffect(() => {
    if (authUser) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [authUser, isAdmin, router]);

  const isPinStage = !!(state?.requiresPin || userIdForPin) && !state?.accountLocked;

  if (state?.accountLocked) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl font-headline text-destructive">Account Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {state.message || 'Your account has been locked due to too many failed 2FA attempts. Please contact support to unlock your account.'}
            </p>
          </CardContent>
          <CardFooter>
             <Button variant="outline" asChild className="w-full">
                <Link href="/support">Contact Support</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            {isPinStage ? 'Enter 2FA PIN' : 'Designer Login'}
          </CardTitle>
          <CardDescription>
            {isPinStage ? 'Enter the 6-digit PIN from your authenticator.' : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <form action={dispatch}>
          {isPinStage && userIdForPin && (
            <input type="hidden" name="userIdForPin" value={userIdForPin} />
          )}
          <CardContent className="space-y-4">
            {!isPinStage ? (
              <>
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
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="pin">6-Digit PIN</Label>
                 <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="pin"
                        name="pin"
                        type={showPinInput ? 'text' : 'password'}
                        maxLength={6}
                        placeholder="••••••"
                        required
                        className="pl-10 pr-10 tracking-[0.3em] text-center"
                        aria-invalid={!!state?.errors?.pin}
                        aria-describedby="pin-error"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPinInput(!showPinInput)}
                      aria-label={showPinInput ? "Hide PIN" : "Show PIN"}
                      tabIndex={-1}
                    >
                      {showPinInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                {state?.errors?.pin && <p id="pin-error" className="text-sm text-destructive">{state.errors.pin.join(', ')}</p>}
              </div>
            )}
            {state?.errors?.general && <p className="text-sm text-destructive">{state.errors.general.join(', ')}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton isPinStage={isPinStage} />
            {!isPinStage && (
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Button variant="link" asChild className="p-0 h-auto text-accent">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
