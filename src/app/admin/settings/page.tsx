
'use client';

import { useEffect, useState, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Palette, Users, Info } from 'lucide-react';
import { getSiteSettingsAction, updateSiteSettingsAction, type SiteSettingsFormState } from '@/lib/actions';
import type { SiteSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useActionState(updateSiteSettingsAction, {} as SiteSettingsFormState); // Using useActionState's pending
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
    </Button>
  );
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [initialSettings, setInitialSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form field states
  const [siteTitle, setSiteTitle] = useState('');
  const [allowNewUserRegistrations, setAllowNewUserRegistrations] = useState(true);
  const [primaryHSL, setPrimaryHSL] = useState('');
  const [accentHSL, setAccentHSL] = useState('');

  const initialState: SiteSettingsFormState = { message: null, errors: {}, success: false, settings: null };
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialState);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSiteSettingsAction();
        setInitialSettings(settings);
        setSiteTitle(settings.siteTitle);
        setAllowNewUserRegistrations(settings.allowNewUserRegistrations);
        setPrimaryHSL(settings.themeColors.primaryHSL);
        setAccentHSL(settings.themeColors.accentHSL);
      } catch (error) {
        toast({ title: "Error", description: "Could not load site settings.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, [toast]);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.settings) {
        // Optionally update local state again if server modified data, though typically not needed if form mirrors server
        setInitialSettings(state.settings);
        setSiteTitle(state.settings.siteTitle);
        setAllowNewUserRegistrations(state.settings.allowNewUserRegistrations);
        setPrimaryHSL(state.settings.themeColors.primaryHSL);
        setAccentHSL(state.settings.themeColors.accentHSL);
      }
    }
  }, [state, toast]);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Settings className="mr-3 h-8 w-8 animate-pulse" /> Site Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Site Settings</CardTitle>
        </div>
        <CardDescription>Configure global application settings and preferences.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-8">
          {/* General Settings Section */}
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline flex items-center text-primary"><Info className="mr-2 h-5 w-5" /> General</h3>
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input
                id="siteTitle"
                name="siteTitle"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Your Application Name"
              />
              {state?.errors?.siteTitle && <p className="text-sm text-destructive">{state.errors.siteTitle.join(', ')}</p>}
            </div>
          </section>

          {/* Theme Customization Section */}
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline flex items-center text-primary"><Palette className="mr-2 h-5 w-5" /> Theme Colors (HSL Format)</h3>
            <p className="text-sm text-muted-foreground">
              Enter HSL values (e.g., &quot;271 100% 75.3%&quot;). Changes here are saved but require manual update in <code>globals.css</code> to take effect.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryHSL">Primary Color HSL</Label>
                <Input
                  id="primaryHSL"
                  name="primaryHSL"
                  value={primaryHSL}
                  onChange={(e) => setPrimaryHSL(e.target.value)}
                  placeholder="e.g., 271 100% 75.3%"
                />
                {state?.errors?.primaryHSL && <p className="text-sm text-destructive">{state.errors.primaryHSL.join(', ')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentHSL">Accent Color HSL</Label>
                <Input
                  id="accentHSL"
                  name="accentHSL"
                  value={accentHSL}
                  onChange={(e) => setAccentHSL(e.target.value)}
                  placeholder="e.g., 300 100% 70%"
                />
                {state?.errors?.accentHSL && <p className="text-sm text-destructive">{state.errors.accentHSL.join(', ')}</p>}
              </div>
            </div>
            <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Current Primary:</span>
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: `hsl(${primaryHSL})` }}></div>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm">Current Accent:</span>
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: `hsl(${accentHSL})` }}></div>
                </div>
            </div>
          </section>

          {/* User Management Section */}
          <section className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-xl font-semibold font-headline flex items-center text-primary"><Users className="mr-2 h-5 w-5" /> User Management</h3>
            <div className="flex items-center space-x-3">
              <Switch
                id="allowNewUserRegistrations"
                name="allowNewUserRegistrations"
                checked={allowNewUserRegistrations}
                onCheckedChange={setAllowNewUserRegistrations}
              />
              <Label htmlFor="allowNewUserRegistrations" className="text-base">
                Allow New User Registrations
              </Label>
            </div>
            {state?.errors?.allowNewUserRegistrations && <p className="text-sm text-destructive">{state.errors.allowNewUserRegistrations.join(', ')}</p>}
          </section>
          
          {state?.errors?.general && <p className="text-sm text-destructive p-4 text-center">{state.errors.general.join(', ')}</p>}

        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
