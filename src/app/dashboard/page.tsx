'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette, PlusCircle, UserCog } from 'lucide-react';

export default function UserDashboardPage() {
  const { user } = useAuth(); // isLoading and isAdmin checks are in layout

  if (!user) {
    // This should ideally not be reached due to layout protection
    return <p>Loading user data or redirecting...</p>;
  }

  const displayName = 'name' in user && user.name ? user.name : 'Designer';

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Welcome, {displayName}!</CardTitle>
          <CardDescription>This is your personal dashboard. Manage your designs and profile settings here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            From here, you can showcase your creativity and manage your contributions to Reactiverse.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardActionCard
              title="My Designs"
              description="View and manage all your submitted designs."
              icon={<Palette className="h-8 w-8 text-primary" />}
              href="/dashboard/designs"
              actionText="View My Designs"
            />
            <DashboardActionCard
              title="Submit New Design"
              description="Share your latest creation with the community."
              icon={<PlusCircle className="h-8 w-8 text-primary" />}
              href="/dashboard/designs/submit"
              actionText="Add New Design"
            />
            <DashboardActionCard
              title="Profile Settings"
              description="Update your personal information and password."
              icon={<UserCog className="h-8 w-8 text-primary" />}
              href="/dashboard/profile"
              actionText="Go to Settings"
            />
          </div>
           <p className="text-sm text-muted-foreground pt-4">
            Start by submitting a new design or updating your profile to make it stand out!
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
