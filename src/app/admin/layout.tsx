
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Palette, Settings, LogOut, ShieldCheck, UserCog, FileText, Image as ImageIcon } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/core/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface AdminLayoutProps {
  children: ReactNode;
}

const mainNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/designs', label: 'Manage Designs', icon: Palette },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/account-settings', label: 'My Account', icon: UserCog },
];

const contentEditingNavItems = [
    { href: '/admin/edit-content/about', label: 'Edit About Page', icon: FileText },
    { href: '/admin/edit-content/support', label: 'Edit Support Page', icon: FileText },
    { href: '/admin/edit-content/guidelines', label: 'Edit Guidelines Page', icon: FileText },
    { href: '/admin/edit-content/top-designers', label: 'Edit Top Designers Page', icon: FileText },
    { href: '/admin/edit-content/logo', label: 'Change Site Logo', icon: ImageIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This client-side check remains important for UX after initial load,
    // even with middleware. Middleware handles server-side protection.
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
  
  const displayName = user && user.isAdmin && user.name ? user.name : 'Admin';
  const avatarUrl = user && user.isAdmin && user.avatarUrl ? user.avatarUrl : undefined;

  const handleLogout = async () => {
    await logout(); // AuthContext logout is now async
    router.push('/'); // Redirect to home after logout
  };


  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed top-0 left-0 h-full md:w-72 bg-card text-card-foreground shadow-lg flex flex-col p-4 space-y-6 z-40 transition-transform -translate-x-full md:translate-x-0 overflow-y-auto">
        <div className="px-2 py-2">
          <Logo />
        </div>
        
        <nav className="flex-grow space-y-1">
          {mainNavItems.map((item) => (
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="content-editing" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted hover:no-underline [&[data-state=open]>svg]:text-primary">
                 <Settings className="h-5 w-5" /> Site Content
              </AccordionTrigger>
              <AccordionContent className="pl-4 pt-1 pb-0">
                <nav className="flex-grow space-y-1">
                    {contentEditingNavItems.map((item) => (
                        <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/80",
                            pathname === item.href && "bg-muted/80 text-primary font-medium"
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        </Link>
                    ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
          </Accordion>


        </nav>

        <div className="mt-auto border-t pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="admin avatar"/>
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
        </div>
      </aside>
      <main className="flex-1 md:ml-72 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
