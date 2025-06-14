
'use client';

import { useState } from 'react';
import UpdateProfileForm from '@/components/dashboard/forms/UpdateProfileForm';
import ChangePasswordForm from '@/components/dashboard/forms/ChangePasswordForm';
import TwoFactorAuthForm from '@/components/dashboard/forms/TwoFactorAuthForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lock, ShieldCheck, Edit3, XCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [editingSection, setEditingSection] = useState<string | null>(null); // 'password' or '2fa'

  const renderSectionSelector = (
    sectionKey: 'password' | '2fa',
    title: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setEditingSection(sectionKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingSection(sectionKey); }}
      aria-label={`Edit ${title}`}
      aria-haspopup="form"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <CardTitle className="text-xl font-headline text-primary">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Edit <ChevronRight className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-8">
      <UpdateProfileForm />

      {editingSection === 'password' ? (
        <div className="space-y-4">
          <ChangePasswordForm />
          <Button variant="outline" onClick={() => setEditingSection(null)} className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" />
            Close Password Settings
          </Button>
        </div>
      ) : (
        renderSectionSelector(
          'password',
          'Change Password',
          'Update your account password for better security.',
          <Lock className="h-8 w-8 text-primary" />
        )
      )}

      {editingSection === '2fa' ? (
        <div className="space-y-4">
          <TwoFactorAuthForm />
          <Button variant="outline" onClick={() => setEditingSection(null)} className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" />
            Close 2FA Settings
          </Button>
        </div>
      ) : (
        renderSectionSelector(
          '2fa',
          'Two-Factor Authentication',
          'Manage your 2FA settings for enhanced security.',
          <ShieldCheck className="h-8 w-8 text-primary" />
        )
      )}
    </div>
  );
}
