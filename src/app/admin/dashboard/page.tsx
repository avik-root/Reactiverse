'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, Users, Palette, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))]">
        <LayoutDashboard className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Manage users, designs, and site settings from here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">Welcome, <span className="font-semibold text-accent">{user.username || 'Admin'}</span>!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardActionCard
              title="Manage Designs"
              description="View, edit, or remove design submissions."
              icon={<Palette className="h-8 w-8 text-primary" />}
              href="#"
              actionText="Go to Designs"
            />
            <DashboardActionCard
              title="Manage Users"
              description="View user accounts and manage roles."
              icon={<Users className="h-8 w-8 text-primary" />}
              href="#"
              actionText="Go to Users"
            />
            <DashboardActionCard
              title="Site Settings"
              description="Configure global application settings."
              icon={<Settings className="h-8 w-8 text-primary" />}
              href="#"
              actionText="Go to Settings"
            />
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            This is a conceptual dashboard. Full management functionalities are not yet implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  actionText: string;
}

function DashboardActionCard({ title, description, icon, href, actionText }: DashboardActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        {icon}
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button asChild className="w-full" variant="outline">
          <Link href={href}>{actionText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
