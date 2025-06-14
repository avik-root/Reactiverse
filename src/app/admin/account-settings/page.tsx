
'use client';

import { useState } from 'react';
import UpdateAdminProfileForm from '@/components/admin/forms/UpdateAdminProfileForm';
import ChangeAdminPasswordForm from '@/components/admin/forms/ChangeAdminPasswordForm';
import AdminTwoFactorAuthForm from '@/components/admin/forms/AdminTwoFactorAuthForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lock, ShieldCheck, UserCog, XCircle } from 'lucide-react';

export default function AdminAccountSettingsPage() {
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
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                 <UserCog className="h-8 w-8 text-primary" />
                 <CardTitle className="text-3xl font-headline text-primary">My Admin Account</CardTitle>
            </div>
            <CardDescription>Manage your administrator profile, password, and security settings.</CardDescription>
        </CardHeader>
      </Card>
      
      <UpdateAdminProfileForm />

      {editingSection === 'password' ? (
        <div className="space-y-4">
          <ChangeAdminPasswordForm />
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
          <AdminTwoFactorAuthForm />
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
