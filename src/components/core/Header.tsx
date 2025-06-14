'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, LogOut, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
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
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name || user.username)}`} alt={user.name || user.username || 'User'} data-ai-hint="profile avatar" />
                    <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none font-headline">
                      {user.name || user.username}
                    </p>
                    { 'email' in user && user.email && (
                       <p className="text-xs leading-none text-muted-foreground">
                         {user.email}
                       </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Dashboard
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
