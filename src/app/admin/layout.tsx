
'use client';

import { useEffect, type ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Palette, Settings, LogOut, ShieldCheck, UserCog, FileText, Image as ImageIcon, Loader2, Users2, MailOpen, LayoutList, MessagesSquare, Megaphone, HelpCircle, Menu as MenuIcon, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/core/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
}

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/create-account', '/admin', '/admin/'];
const ADMIN_LOGIN_URL = '/admin/login';
const ADMIN_CREATE_ACCOUNT_URL = '/admin/create-account';
const ADMIN_DASHBOARD_URL = '/admin/dashboard';


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
    { href: '/admin/edit-content/team', label: 'Edit Team Members', icon: Users2 },
    { href: '/admin/edit-content/logo', label: 'Change Site Logo', icon: ImageIcon },
    { href: '/admin/subscribers', label: 'View Subscribers', icon: MailOpen },
];

const communityNavItems = [
    { href: '/admin/forum-categories', label: 'Manage Forum Categories', icon: LayoutList },
    { href: '/admin/forum/general-discussion', label: 'Edit General Discussion', icon: MessagesSquare },
    { href: '/admin/forum/announcements', label: 'Edit Announcements', icon: Megaphone },
    { href: '/admin/forum/support-qa', label: 'Edit Support & Q/A', icon: HelpCircle },
    { href: '/admin/verifications', label: 'User Verifications', icon: BadgeCheck },
];

interface AdminNavContentProps {
  onLinkClick?: () => void;
}

function AdminNavContent({ onLinkClick }: AdminNavContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleLinkNavigation = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const nameToProcess = user && user.isAdmin && 'name' in user && user.name ? user.name : 'Admin';
    return nameToProcess.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = user && user.isAdmin && 'name' in user && user.name ? user.name : 'Admin';
  const avatarUrl = user && user.isAdmin && 'avatarUrl' in user && user.avatarUrl ? user.avatarUrl : undefined;


  return (
    <>
      <div className="px-2 py-2">
        <Logo />
      </div>
      <nav className="flex-grow space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <Link
            key={`main-${item.href}`}
            href={item.href}
            onClick={handleLinkNavigation}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
              pathname === item.href && "bg-muted text-primary font-semibold shadow-sm"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}

        <Accordion type="multiple" className="w-full" defaultValue={['content-editing', 'community-management']}>
          <AccordionItem value="content-editing" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted hover:no-underline [&[data-state=open]>svg]:text-primary">
              <FileText className="h-5 w-5" /> Site Content
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-1 pb-0">
              <nav className="flex-grow space-y-1">
                {contentEditingNavItems.map((item) => (
                  <Link
                    key={`content-${item.href}`}
                    href={item.href}
                    onClick={handleLinkNavigation}
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
          <AccordionItem value="community-management" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted hover:no-underline [&[data-state=open]>svg]:text-primary">
              <Users2 className="h-5 w-5" /> Community & Users
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-1 pb-0">
              <nav className="flex-grow space-y-1">
                {communityNavItems.map((item) => (
                  <Link
                    key={`community-${item.href}`}
                    href={item.href}
                    onClick={handleLinkNavigation}
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
            <AvatarImage
              key={avatarUrl}
              src={avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`}
              alt={displayName} data-ai-hint="admin avatar" />
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
    </>
  );
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.includes(pathname);

  useEffect(() => {
    // If auth is still loading its initial state, don't make redirect decisions.
    if (isLoading) {
      return;
    }

    // If on a protected admin page...
    if (!isPublicAdminPage) {
      // ...and user is not an authenticated admin, redirect to login.
      if (!user || !isAdmin) {
        router.push(ADMIN_LOGIN_URL);
        return; // Exit early after redirect
      }
    } else { // If on a public admin page (login, create, or /admin root)...
      // ...and user IS an authenticated admin, redirect them to the dashboard.
      // This handles cases like an admin landing on /admin/login when already logged in.
      if (user && isAdmin) {
         if (pathname === ADMIN_LOGIN_URL || pathname === ADMIN_CREATE_ACCOUNT_URL || pathname === '/admin' || pathname === '/admin/') {
            router.push(ADMIN_DASHBOARD_URL);
            return; // Exit early after redirect
        }
      }
    }
  }, [user, isAdmin, isLoading, router, pathname, isPublicAdminPage]);


  // Render loading spinner if AuthContext is still initializing
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <ShieldCheck className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Verifying Admin Access...</p>
      </div>
    );
  }

  // If on a public admin page, render children directly.
  // The useEffect above handles redirecting to dashboard if already logged in.
  if (isPublicAdminPage) {
    return <>{children}</>;
  }

  // If NOT on a public page, AND we are past initial loading, BUT user is not an admin,
  // show a "redirecting" spinner. The useEffect should have already initiated the redirect.
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // If authenticated admin and on a protected page, render the full admin layout
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed top-0 left-0 h-full md:w-72 bg-card text-card-foreground shadow-lg flex-col p-4 space-y-6 z-40 transition-transform -translate-x-full md:translate-x-0 hidden md:flex">
        <AdminNavContent />
      </aside>
      
      <main className="flex-1 md:ml-72 overflow-y-auto">
        <header className="md:hidden sticky top-0 bg-background/95 backdrop-blur-sm z-30 p-3 border-b shadow-sm h-16 flex items-center justify-between">
            <Logo />
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MenuIcon className="h-6 w-6" />
                        <span className="sr-only">Open Admin Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-4 flex flex-col bg-card text-card-foreground space-y-6">
                    <AdminNavContent onLinkClick={() => setIsMobileSheetOpen(false)} />
                </SheetContent>
            </Sheet>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
         {children}
        </div>
      </main>
    </div>
  );
}

