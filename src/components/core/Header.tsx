
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, LogOut, ShieldCheck, UserPlus, LogIn, LayoutDashboard, Home, Users, LifeBuoy, Info } from 'lucide-react'; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/designers", label: "Top Designers", icon: Users },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

const Header = () => {
  const { user, isAdmin, logout, isLoading } = useAuth();
  const router = useRouter(); // Initialize router

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const nameToProcess = typeof name === 'string' ? name : (user && 'username' in user ? user.username : 'U');
    return nameToProcess.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const displayName = user ? (('name' in user && user.name) ? user.name : (('username' in user) ? user.username : 'User')) : 'User';
  const displayEmail = user && 'email' in user ? user.email : undefined;

  const handleLogoutAndRedirect = async () => {
    await logout(); // from AuthContext, clears state and cookies
    router.push('/'); // Redirect to homepage after logout completes
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Button variant="ghost" asChild key={link.href}>
                <Link href={link.href} className="flex items-center text-sm">
                  <>
                    <link.icon className="mr-1.5 h-4 w-4" /> {link.label}
                  </>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile Nav (Dropdown for main links) */}
          <div className="md:hidden">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <>
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation</span>
                  </>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center">
                      <>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={(user && 'avatarUrl' in user ? user.avatarUrl : undefined) || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="profile avatar" />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none font-headline">
                      {displayName}
                    </p>
                    { displayEmail && (
                       <p className="text-xs leading-none text-muted-foreground">
                         {displayEmail}
                       </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        User Dashboard
                      </>
                    </Link>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem onClick={handleLogoutAndRedirect} className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive">
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </>
                </Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/signup">
                 <>
                   <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                 </>
                </Link>
              </Button>
               {/* Mobile Login/Signup buttons */}
              <Button variant="ghost" asChild className="sm:hidden">
                <Link href="/auth/login"><LogIn className="h-5 w-5" /></Link>
              </Button>
               <Button asChild size="icon" className="sm:hidden">
                <Link href="/auth/signup"><UserPlus className="h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden xsm:inline-flex">
                <Link href="/admin/login">Admin</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
