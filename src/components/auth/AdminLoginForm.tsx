
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAdmin, type AdminLoginFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Eye, EyeOff, KeyRound, ShieldCheck as PinIcon } from 'lucide-react';

function SubmitButton({ isPinStage }: { isPinStage: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isPinStage ? 'Verifying PIN...' : 'Logging in...') :
        isPinStage ? <><PinIcon className="mr-2 h-4 w-4" /> Verify PIN</> : <><ShieldAlert className="mr-2 h-4 w-4" /> Admin Login</>}
    </Button>
  );
}

export default function AdminLoginForm() {
  const initialState: AdminLoginFormState = { message: null, errors: {}, requiresPin: false };
  const [state, dispatch] = useActionState(loginAdmin, initialState);
  const { toast } = useToast();
  const { login: authLogin, user: authUser, isAdmin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [adminIdForPin, setAdminIdForPin] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (state?.message) {
      if (state.adminUser) { // Successful login
        authLogin(state.adminUser, true);
        toast({
          title: 'Admin Login Successful',
          description: 'Redirecting to dashboard...',
        });
        router.push('/admin/dashboard');
      } else if (state.requiresPin && state.adminIdForPin) {
        setAdminIdForPin(state.adminIdForPin);
        toast({
          title: 'Admin 2FA Required',
          description: state.message || 'Please enter your 6-digit PIN.',
          variant: 'default'
        });
      } else if (!state.requiresPin && !state.adminUser) { // Login failed (password or username error)
        toast({
          title: 'Admin Login Failed',
          description: state.message || 'An error occurred.',
          variant: 'destructive',
        });
        setAdminIdForPin(undefined);
      } else if (state.requiresPin && !state.adminUser) { // PIN verification failed
         toast({
          title: 'Admin PIN Verification Failed',
          description: state.message || 'Incorrect PIN.',
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, authLogin, router]);

  useEffect(() => {
    if (authUser && isAdmin) {
      // No explicit redirect here to prevent loops; login handler pushes to dashboard.
      // This effect mainly handles if user is already admin and lands here.
    }
  }, [authUser, isAdmin]);

  const isPinStageCurrent = !!(state?.requiresPin || adminIdForPin);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            {isPinStageCurrent ? 'Enter Admin 2FA PIN' : 'Admin Access'}
          </CardTitle>
          <CardDescription>
            {isPinStageCurrent ? 'Enter the 6-digit PIN for your admin account.' : 'Enter administrator credentials.'}
          </CardDescription>
        </CardHeader>
        <form action={dispatch}>
          {isPinStageCurrent && adminIdForPin && (
            <input type="hidden" name="adminIdForPin" value={adminIdForPin} />
          )}
          <CardContent className="space-y-4">
            {!isPinStageCurrent ? (
              <>
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
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="pin">6-Digit PIN</Label>
                 <div className="relative">
                    <PinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <CardFooter>
            <SubmitButton isPinStage={isPinStageCurrent} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
