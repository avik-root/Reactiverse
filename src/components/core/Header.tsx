'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, LogOut, ShieldCheck, UserPlus, LogIn, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, isAdmin, logout, isLoading } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    // Handle cases where name might be just username for admin
    const nameToProcess = typeof name === 'string' ? name : (user && 'username' in user ? user.username : 'U');
    return nameToProcess.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  
  const displayName = user ? ('name' in user && user.name ? user.name : ('username' in user ? user.username : 'User')) : 'User';


  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={(user as any).avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(displayName)}`} alt={displayName} data-ai-hint="profile avatar" />
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
                    { 'email' in user && user.email && (
                       <p className="text-xs leading-none text-muted-foreground">
                         {user.email}
                       </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      User Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">
                 <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/login">Admin</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
