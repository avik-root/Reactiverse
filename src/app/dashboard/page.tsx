
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette, PlusCircle, UserCog, Heart, BarChart3, Info, Eye } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Design } from '@/lib/types';
import { getAllDesignsAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LikeButton from '@/components/design/LikeButton'; // Import LikeButton

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
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="bg-card/70">
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

interface MostLikedDesignPreviewCardProps {
  design: Design;
  onLikeChange: (designId: string, newIsLiked: boolean, newLikeCount: number) => void;
  currentUserId?: string;
}

function MostLikedDesignPreviewCard({ design, onLikeChange, currentUserId }: MostLikedDesignPreviewCardProps) {
  const previewSrcDoc = useMemo(() => {
    if (!design.codeBlocks || design.codeBlocks.length === 0) return null;
    const htmlBlock = design.codeBlocks.find(block => block.language.toLowerCase() === 'html');
    if (!htmlBlock) return null;
    const cssBlocks = design.codeBlocks.filter(block =>
      block.language.toLowerCase() === 'css' ||
      block.language.toLowerCase() === 'scss' ||
      block.language.toLowerCase() === 'tailwind css'
    );
    const htmlContent = htmlBlock.code;
    const cssContent = cssBlocks.map(block => block.code).join('\\n');
    return `
      <html>
        <head>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; background-color: transparent; }
            ${cssContent}
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
  }, [design.codeBlocks]);

  const initialIsLiked = currentUserId ? design.likedBy.includes(currentUserId) : false;
  const initialLikeCount = design.likedBy.length;

  const handleInternalLikeToggle = (newLikeCount: number, newIsLiked: boolean) => {
    onLikeChange(design.id, newIsLiked, newLikeCount);
  };


  return (
    <Card key={design.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
        {previewSrcDoc ? (
          <div className="w-full h-full transform scale-[0.35] origin-center flex items-center justify-center pointer-events-none">
            <iframe
              srcDoc={previewSrcDoc}
              title={`${design.title} card preview`}
              sandbox="allow-same-origin"
              className="w-[calc(100%/0.35)] h-[calc(100%/0.35)] border-0 overflow-hidden bg-transparent"
              scrolling="no"
            />
          </div>
        ) : (
          <Palette className="h-16 w-16 text-primary/70" />
        )}
      </div>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-lg font-semibold truncate" title={design.title}>{design.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow py-0">
        <p className="text-xs text-muted-foreground line-clamp-2">{design.description}</p>
      </CardContent>
      <CardFooter className="pt-3 pb-3 text-xs justify-between items-center">
         <LikeButton
            designId={design.id}
            initialLikeCount={initialLikeCount}
            initialIsLiked={initialIsLiked}
            currentUserId={currentUserId}
            onLikeToggle={handleInternalLikeToggle}
        />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/designs/edit/${design.id}`}>
              <Eye className="mr-1 h-3 w-3"/> View/Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function UserDashboardPage() {
  const { user } = useAuth();
  const [userDesigns, setUserDesigns] = useState<Design[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const currentUserId = user && 'id' in user ? user.id : undefined;

  useEffect(() => {
    async function fetchUserStats() {
      if (!user || !('id' in user)) {
        setIsLoadingStats(false);
        return;
      }
      setIsLoadingStats(true);
      try {
        const allDesigns = await getAllDesignsAction();
        const filteredDesigns = allDesigns.filter(design => design.submittedByUserId === user.id);
        setUserDesigns(filteredDesigns);
      } catch (error) {
        console.error("Failed to fetch user designs for dashboard:", error);
      }
      setIsLoadingStats(false);
    }
    fetchUserStats();
  }, [user]);

  const handleLikeChange = (designId: string, newIsLiked: boolean, serverLikeCount: number) => {
    setUserDesigns(prevDesigns =>
      prevDesigns.map(d => {
        if (d.id === designId) {
          let updatedLikedBy = [...d.likedBy];
          if (currentUserId) {
            if (newIsLiked && !updatedLikedBy.includes(currentUserId)) {
              updatedLikedBy.push(currentUserId);
            } else if (!newIsLiked && updatedLikedBy.includes(currentUserId)) {
              updatedLikedBy = updatedLikedBy.filter(id => id !== currentUserId);
            }
          }
          return { ...d, likedBy: updatedLikedBy };
        }
        return d;
      })
    );
  };

  const totalLikes = useMemo(() => {
    return userDesigns.reduce((acc, design) => acc + (design.likedBy?.length || 0), 0);
  }, [userDesigns]);

  const mostLikedDesigns = useMemo(() => {
    return [...userDesigns]
      .sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
      .slice(0, 3); // Show top 3
  }, [userDesigns]);

  if (!user) {
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
           {isLoadingStats ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
             </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Designs" value={userDesigns.length} icon={<Palette className="h-5 w-5 text-accent" />} />
                <StatCard title="Total Likes Received" value={totalLikes} icon={<Heart className="h-5 w-5 text-accent" />} />
                <StatCard title="Account Status" value={user.isVerified ? "Verified" : "Not Verified"} icon={<UserCog className="h-5 w-5 text-accent" />} description={!user.isVerified ? "Complete your profile for verification." : "Your account is verified."} />
            </div>
           )}

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
        </CardContent>
      </Card>

      {mostLikedDesigns.length > 0 && (
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <BarChart3 className="mr-2 h-6 w-6" /> Your Most Popular Designs
            </CardTitle>
            <CardDescription>A quick look at your designs that are getting the most love from the community.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostLikedDesigns.map(design => (
              <MostLikedDesignPreviewCard 
                key={design.id} 
                design={design} 
                onLikeChange={handleLikeChange}
                currentUserId={currentUserId}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {userDesigns.length === 0 && !isLoadingStats && (
         <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>No Designs Yet!</AlertTitle>
            <AlertDescription>
              You haven&apos;t submitted any designs.
              <Button variant="link" asChild className="p-0 h-auto ml-1 text-accent">
                <Link href="/dashboard/designs/submit">Click here to add your first design!</Link>
              </Button>
            </AlertDescription>
          </Alert>
      )}
       <p className="text-sm text-muted-foreground pt-4 text-center">
            Start by submitting a new design or updating your profile to make it stand out!
        </p>
    </div>
  );
}
