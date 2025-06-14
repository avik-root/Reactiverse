

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createAdminAccountAction, type AdminCreateAccountFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus, KeyRound, ShieldCheck, AtSign, UserSquare2, Phone, Eye, EyeOff } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : <><ShieldCheck className="mr-2 h-4 w-4" /> Create Admin Account</>}
    </Button>
  );
}

export default function AdminCreateAccountForm() {
  const initialState: AdminCreateAccountFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(createAdminAccountAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        router.push('/admin/login');
      }
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-12">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center mb-3">
             <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Setup Admin Account</CardTitle>
          <CardDescription>Create the first administrator account for Reactiverse.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserSquare2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      id="name" 
                      name="name" 
                      type="text" 
                      placeholder="Admin Full Name" 
                      required 
                      className="pl-10"
                      aria-invalid={!!state?.errors?.name}
                      aria-describedby="name-error"
                  />
                </div>
                {state?.errors?.name && <p id="name-error" className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Admin Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      id="username" 
                      name="username" 
                      type="text" 
                      placeholder="e.g., admin_user" 
                      required 
                      className="pl-10"
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
                <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="admin@example.com" 
                    required 
                    className="pl-10"
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
                <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+1234567890" 
                    required 
                    className="pl-10"
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
                <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <PasswordStrengthMeter password={password} />
              {state?.errors?.password && <p id="password-error" className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required 
                    className="pl-10 pr-10"
                    aria-invalid={!!state?.errors?.confirmPassword}
                    aria-describedby="confirmPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {state?.errors?.confirmPassword && <p id="confirmPassword-error" className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
            </div>
            {state?.errors?.general && <p className="text-sm text-destructive text-center">{state.errors.general.join(', ')}</p>}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
