
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Palette, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/core/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/designs', label: 'Manage Designs', icon: Palette },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <ShieldCheck className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Loading Admin Area...</p>
      </div>
    );
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const displayName = user && 'name' in user ? user.name : 'Admin';


  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed top-0 left-0 h-full md:w-64 bg-card text-card-foreground shadow-lg flex flex-col p-4 space-y-6 z-40 transition-transform -translate-x-full md:translate-x-0">
        <div className="px-2 py-2">
          <Logo />
        </div>
        
        <nav className="flex-grow space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                pathname === item.href && "bg-muted text-primary font-semibold shadow-sm"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={(user && 'avatarUrl' in user ? user.avatarUrl : undefined) || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="admin avatar"/>
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
            </div>
            <Button variant="ghost" onClick={logout} className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
        </div>
      </aside>
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Header for mobile */}
        <header className="md:hidden sticky top-0 bg-background/80 backdrop-blur-md z-30 p-4 mb-4 border-b rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <Logo />
                {/* Mobile menu trigger could be added here if sidebar is collapsible on mobile */}
            </div>
        </header>
        {children}
      </main>
    </div>
  );
}
