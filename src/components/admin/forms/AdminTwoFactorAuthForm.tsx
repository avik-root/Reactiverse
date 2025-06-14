
'use client';

import { useActionState, useEffect, useState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { enableAdminTwoFactorAction, disableAdminTwoFactorAction, type AdminTwoFactorAuthFormState } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

function SubmitButton({ actionType }: { actionType: 'enable' | 'disable' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} variant={actionType === 'disable' ? 'destructive' : 'default'}>
      {pending ? (actionType === 'enable' ? 'Enabling 2FA...' : 'Disabling 2FA...') :
        actionType === 'enable' ? <><ShieldCheck className="mr-2 h-4 w-4" /> Enable 2FA</> : <><ShieldOff className="mr-2 h-4 w-4" /> Disable 2FA</>}
    </Button>
  );
}

export default function AdminTwoFactorAuthForm() {
  const { user: adminUser, updateAuthUser } = useAuth();
  const { toast } = useToast();

  const initialEnableState: AdminTwoFactorAuthFormState = { message: null, errors: {}, success: false, actionType: 'enable' };
  const initialDisableState: AdminTwoFactorAuthFormState = { message: null, errors: {}, success: false, actionType: 'disable' };

  const [enableState, enableDispatch] = useActionState(enableAdminTwoFactorAction, initialEnableState);
  const [disableState, disableDispatch] = useActionState(disableAdminTwoFactorAction, initialDisableState);

  const [isTwoFactorEnabledLocally, setIsTwoFactorEnabledLocally] = useState(false);
  const [showEnableForm, setShowEnableForm] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showCurrentPasswordFor2FA, setShowCurrentPasswordFor2FA] = useState(false);
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (adminUser && adminUser.isAdmin && 'twoFactorEnabled' in adminUser) {
        setIsTwoFactorEnabledLocally(adminUser.twoFactorEnabled);
    }
  }, [adminUser]);

  useEffect(() => {
    const activeState = enableState?.actionType === 'enable' ? enableState : disableState;

    if (activeState?.message && activeState.message !== lastProcessedMessage) {
      setLastProcessedMessage(activeState.message); // Mark this message as processed

      toast({
        title: activeState.success ? 'Success!' : 'Error',
        description: activeState.message,
        variant: activeState.success ? 'default' : 'destructive',
      });

      if (activeState.success) {
        const new2FAStatusByAction = activeState.actionType === 'enable';

        updateAuthUser(currentUser => {
            if (!currentUser || !currentUser.isAdmin) return currentUser;
            if (('twoFactorEnabled' in currentUser) && currentUser.twoFactorEnabled !== new2FAStatusByAction) {
                return { ...currentUser, twoFactorEnabled: new2FAStatusByAction };
            }
            return currentUser;
        });

        setShowEnableForm(false);
        setShowDisableForm(false);
        setShowCurrentPasswordFor2FA(false);
        const enableForm = document.getElementById('enableAdmin2FAForm') as HTMLFormElement;
        const disableForm = document.getElementById('disableAdmin2FAForm') as HTMLFormElement;
        enableForm?.reset();
        disableForm?.reset();
      }
    }
  }, [enableState, disableState, toast, updateAuthUser, lastProcessedMessage]);

  if (!adminUser || !adminUser.isAdmin) {
    return <p>Loading admin data or not authorized...</p>;
  }

  const handleToggleChange = useCallback((checked: boolean) => {
    setShowCurrentPasswordFor2FA(false);
    if (checked) {
        setShowEnableForm(true);
        setShowDisableForm(false);
    } else {
        setShowDisableForm(true);
        setShowEnableForm(false);
    }
  }, [setShowEnableForm, setShowDisableForm]);

  return (
    <Card className="w-full shadow-xl mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Admin Two-Factor Authentication (2FA)</CardTitle>
        <CardDescription>
          {isTwoFactorEnabledLocally
            ? "2FA is currently enabled for your admin account."
            : "2FA is currently disabled. Enable it for an extra layer of security."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="adminTwoFactorToggle"
            checked={isTwoFactorEnabledLocally}
            onCheckedChange={handleToggleChange}
            aria-label="Toggle Admin Two-Factor Authentication"
          />
          <Label htmlFor="adminTwoFactorToggle" className="text-lg">
            {isTwoFactorEnabledLocally ? '2FA Enabled' : '2FA Disabled'}
          </Label>
        </div>

        {showEnableForm && !isTwoFactorEnabledLocally && (
          <form id="enableAdmin2FAForm" action={enableDispatch} className="space-y-4 pt-4 border-t mt-4">
            <input type="hidden" name="adminId" value={adminUser.id} />
            <p className="text-sm text-muted-foreground">To enable 2FA, set a 6-digit PIN and confirm your current password.</p>
            <div className="space-y-2">
              <Label htmlFor="pin">New 6-Digit PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="pin" name="pin" type="password" maxLength={6} placeholder="••••••" required className="pl-10 tracking-[0.3em] text-center" aria-describedby="enable-pin-error"/>
              </div>
              {enableState?.errors?.pin && <p id="enable-pin-error" className="text-sm text-destructive">{enableState.errors.pin.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPin" name="confirmPin" type="password" maxLength={6} placeholder="••••••" required className="pl-10 tracking-[0.3em] text-center" aria-describedby="enable-confirmPin-error"/>
              </div>
              {enableState?.errors?.confirmPin && <p id="enable-confirmPin-error" className="text-sm text-destructive">{enableState.errors.confirmPin.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPasswordFor2FA_enable_admin">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="currentPasswordFor2FA_enable_admin"
                    name="currentPasswordFor2FA"
                    type={showCurrentPasswordFor2FA ? 'text' : 'password'}
                    required
                    className="pl-10 pr-10"
                    aria-describedby="enable-currentPassword-error"
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPasswordFor2FA(!showCurrentPasswordFor2FA)}
                  aria-label={showCurrentPasswordFor2FA ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showCurrentPasswordFor2FA ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {enableState?.errors?.currentPasswordFor2FA && <p id="enable-currentPassword-error" className="text-sm text-destructive">{enableState.errors.currentPasswordFor2FA.join(', ')}</p>}
            </div>
            {enableState?.errors?.general && <p className="text-sm text-destructive">{enableState.errors.general.join(', ')}</p>}
            <CardFooter className="p-0 pt-2 flex gap-2">
              <SubmitButton actionType="enable" />
              <Button variant="outline" type="button" onClick={() => {setShowEnableForm(false); setShowCurrentPasswordFor2FA(false);}} className="w-full sm:w-auto">Cancel</Button>
            </CardFooter>
          </form>
        )}

        {showDisableForm && isTwoFactorEnabledLocally && (
          <form id="disableAdmin2FAForm" action={disableDispatch} className="space-y-4 pt-4 border-t mt-4">
            <input type="hidden" name="adminId" value={adminUser.id} />
             <p className="text-sm text-muted-foreground">To disable 2FA, please confirm your current password.</p>
            <div className="space-y-2">
              <Label htmlFor="currentPasswordFor2FA_disable_admin">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPasswordFor2FA_disable_admin"
                  name="currentPasswordFor2FA"
                  type={showCurrentPasswordFor2FA ? 'text' : 'password'}
                  required
                  className="pl-10 pr-10"
                  aria-describedby="disable-currentPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPasswordFor2FA(!showCurrentPasswordFor2FA)}
                  aria-label={showCurrentPasswordFor2FA ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showCurrentPasswordFor2FA ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {disableState?.errors?.currentPasswordFor2FA && <p id="disable-currentPassword-error" className="text-sm text-destructive">{disableState.errors.currentPasswordFor2FA.join(', ')}</p>}
            </div>
            {disableState?.errors?.general && <p className="text-sm text-destructive">{disableState.errors.general.join(', ')}</p>}
             <CardFooter className="p-0 pt-2 flex gap-2">
                <SubmitButton actionType="disable" />
                <Button variant="outline" type="button" onClick={() => {setShowDisableForm(false); setShowCurrentPasswordFor2FA(false);}} className="w-full sm:w-auto">Cancel</Button>
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
