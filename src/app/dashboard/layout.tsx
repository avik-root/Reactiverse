
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PencilRuler, UserCog, Palette, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/designs', label: 'My Designs', icon: Palette },
  { href: '/dashboard/designs/submit', label: 'Submit Design', icon: PlusCircle },
  { href: '/dashboard/profile', label: 'Profile Settings', icon: UserCog },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || isAdmin)) { // Redirect if not logged in as a regular user or if admin
      router.push('/');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.12))]">
        <LayoutDashboard className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] gap-6 py-4 md:py-8">
      <aside className="w-full md:w-64 shrink-0">
        <Card className="shadow-md">
          <CardContent className="p-2 md:p-4">
            <nav className="space-y-1 md:space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                    pathname === item.href && "bg-muted text-primary font-semibold"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>
      <main className="flex-1 min-w-0"> {/* Added min-w-0 for flex child squashing */}
        {children}
      </main>
    </div>
  );
}
