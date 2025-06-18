
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, Users, Palette, Settings, ShieldCheck, UsersRound, BadgeHelp, MailOpen, Info } from 'lucide-react';
import type { AdminDashboardStats } from '@/lib/types';
import { getAdminDashboardStatsAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, description, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-1/3 mb-1" />
          {description && <Skeleton className="h-3 w-full" />}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-card/70 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}


export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!authIsLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authIsLoading, router]);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (isAdmin) {
        setIsLoadingStats(true);
        try {
          const fetchedStats = await getAdminDashboardStatsAction();
          setStats(fetchedStats);
        } catch (error) {
          console.error("Failed to fetch admin dashboard stats:", error);
          setStats(null); // Or set to default error state
        }
        setIsLoadingStats(false);
      }
    }
    if (!authIsLoading && isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin, authIsLoading]);


  if (authIsLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.12))]">
        <ShieldCheck className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">Admin Dashboard</CardTitle>
          </div>
          <CardDescription>
            Welcome, <span className="font-semibold text-accent">{user && 'name' in user ? user.name : 'Admin'}</span>! 
            This is your central hub for managing Reactiverse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
           <section>
            <h2 className="text-2xl font-semibold font-headline mb-4 text-primary/90">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Users" 
                value={stats?.totalUsers ?? '-'} 
                icon={<UsersRound className="h-5 w-5 text-accent" />} 
                description="Registered designers and users."
                isLoading={isLoadingStats}
              />
              <StatCard 
                title="Total Designs" 
                value={stats?.totalDesigns ?? '-'} 
                icon={<Palette className="h-5 w-5 text-accent" />} 
                description="Components shared on the platform."
                isLoading={isLoadingStats}
              />
              <StatCard 
                title="Pending Verifications" 
                value={stats?.pendingVerifications ?? '-'} 
                icon={<BadgeHelp className="h-5 w-5 text-accent" />} 
                description="User verification requests awaiting review."
                isLoading={isLoadingStats}
              />
              <StatCard 
                title="Newsletter Subscribers" 
                value={stats?.newsletterSubscribers ?? '-'} 
                icon={<MailOpen className="h-5 w-5 text-accent" />} 
                description="Users subscribed for updates."
                isLoading={isLoadingStats}
              />
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4 text-primary/90">Management Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardActionCard
                title="Manage Designs"
                description="View, feature, or remove design submissions from users."
                icon={<Palette className="h-8 w-8 text-primary" />}
                href="/admin/designs"
                actionText="Go to Designs"
              />
              <DashboardActionCard
                title="Manage Users"
                description="View user accounts, manage roles, and oversee user activity."
                icon={<Users className="h-8 w-8 text-primary" />}
                href="/admin/users"
                actionText="Go to Users"
              />
              <DashboardActionCard
                title="Site Settings"
                description="Configure global application settings, themes, and registration policies."
                icon={<Settings className="h-8 w-8 text-primary" />}
                href="/admin/settings"
                actionText="Go to Settings"
              />
            </div>
          </section>
          <p className="text-sm text-muted-foreground pt-4 flex items-center justify-center gap-2">
            <Info className="h-4 w-4"/>
            More advanced management functionalities are planned for future updates.
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
    <Card className="hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        {icon}
        <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 h-12 line-clamp-2">{description}</p>
        <Button asChild className="w-full">
          <Link href={href}>{actionText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

