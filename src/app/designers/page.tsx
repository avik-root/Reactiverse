
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { User, Design } from '@/lib/types';
import { getAllUsersAdminAction, getAllDesignsAction, getPageContentAction } from '@/lib/actions';
import DesignerCard from '@/components/designer/DesignerCard';
import DesignerDetailDialog from '@/components/designer/DesignerDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Info, Search, Palette, Users, ListOrdered, PercentSquare, Crown, Medal, Trophy, Star } from 'lucide-react';
import type { TopDesignersPageContent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SealCheckIcon from '@/components/icons/SealCheckIcon'; // Import the SealCheckIcon

interface DesignerStats extends User {
  totalLikes: number;
  totalDesignsUploaded: number;
}

const getInitials = (name?: string) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function DesignersPage() {
  const [content, setContent] = useState<TopDesignersPageContent | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allDesigns, setAllDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedDesignerForDetail, setSelectedDesignerForDetail] = useState<DesignerStats | null>(null);
  const [isDesignerDetailOpen, setIsDesignerDetailOpen] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        const [pageContent, fetchedUsers, designsData] = await Promise.all([
          getPageContentAction('topDesigners') as Promise<TopDesignersPageContent>,
          getAllUsersAdminAction(), // This action now includes isVerified
          getAllDesignsAction()
        ]);
        setContent(pageContent);
        setAllUsers(fetchedUsers.filter(user => !user.id.startsWith('admin-'))); 
        setAllDesigns(designsData);
      } catch (error) {
        console.error("Error fetching data for Designers page:", error);
        setContent(null); 
      }
      setIsLoading(false);
    }
    fetchAllData();
  }, []);

  const fullDesignerStatsList = useMemo(() => {
    if (!allUsers.length || !allDesigns) return [];

    const stats: DesignerStats[] = allUsers.map(user => {
      const designsByThisUser = allDesigns.filter(design => design.submittedByUserId === user.id);
      const totalLikes = designsByThisUser.reduce((sum, design) => sum + (design.likedBy?.length || 0), 0);
      return {
        ...user, // isVerified is already part of the user object from getAllUsersAdminAction
        totalLikes: totalLikes,
        totalDesignsUploaded: designsByThisUser.length,
      };
    });

    return stats.sort((a, b) => {
      if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
      if (b.totalDesignsUploaded !== a.totalDesignsUploaded) return b.totalDesignsUploaded - a.totalDesignsUploaded;
      return a.name.localeCompare(b.name);
    });
  }, [allUsers, allDesigns]);

  const displayableDesignerStatsList = useMemo(() => {
    if (!fullDesignerStatsList.length) return [];
    if (!searchTerm) return fullDesignerStatsList;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return fullDesignerStatsList.filter(
      designer =>
        designer.name.toLowerCase().includes(lowerSearchTerm) ||
        designer.username.toLowerCase().includes(lowerSearchTerm)
    );
  }, [fullDesignerStatsList, searchTerm]);

  const top20Designers = useMemo(() => {
    return displayableDesignerStatsList.filter(d => d.totalLikes > 0 || d.totalDesignsUploaded > 0).slice(0, 20);
  }, [displayableDesignerStatsList]);

  const handleOpenDesignerDetail = (designer: DesignerStats) => {
    setSelectedDesignerForDetail(designer);
    setIsDesignerDetailOpen(true);
  };

  const getPercentileCategory = (rank: number, total: number): string => {
    if (total === 0) return "Contributor";
    const percentile = ((total - rank + 1) / total) * 100;
    if (percentile >= 90) return "Top 10%";
    if (percentile >= 75) return "Top 25%";
    if (percentile >= 50) return "Top 50%";
    return "Valued Contributor";
  };
  
  const getPercentileIcon = (category: string) => {
    if (category === "Top 10%") return <Crown className="h-4 w-4 text-yellow-500" />;
    if (category === "Top 25%") return <Trophy className="h-4 w-4 text-orange-400" />;
    if (category === "Top 50%") return <Medal className="h-4 w-4 text-sky-400" />;
    return <PercentSquare className="h-4 w-4 text-muted-foreground" />;
  };


  if (isLoading || !content) {
    return (
      <div className="container mx-auto py-12 space-y-10">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4" />
            <div className="mt-4"><Skeleton className="h-10 w-full" /></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 border rounded-lg bg-card space-y-3">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-1/3 mx-auto mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-8 w-1/3 mb-4" /></CardHeader>
          <CardContent className="space-y-3">
             {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-12">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Award className="mr-3 h-8 w-8" />
            {content.title}
          </CardTitle>
          <CardDescription>{content.description}</CardDescription>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search designers by name or username..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold font-headline mb-6 flex items-center">
          <Trophy className="mr-2 h-7 w-7 text-yellow-500" /> Top Ranked Designers
        </h2>
        {top20Designers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {top20Designers.map((designer, index) => (
              <DesignerCard
                key={designer.id}
                user={designer} // designer object includes isVerified
                rank={index + 1} 
                highlightMetricLabel="Total Likes"
                highlightMetricValue={designer.totalLikes}
                onOpenDetail={() => handleOpenDesignerDetail(designer)}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{searchTerm ? "No Designers Found" : "No Designers with Activity Yet"}</AlertTitle>
            <AlertDescription>
              {searchTerm ? "No designers match your current search criteria or they have no likes/uploads." : "Be the first to like some designs, or encourage designers to share their work!"}
            </AlertDescription>
          </Alert>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold font-headline mb-6 flex items-center">
          <ListOrdered className="mr-2 h-7 w-7 text-primary" /> Complete Designer Standing
        </h2>
        {displayableDesignerStatsList.length > 0 ? (
          <Card className="shadow-md border-border">
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {displayableDesignerStatsList.map((designer, index) => {
                  const overallRankInFullList = fullDesignerStatsList.findIndex(d => d.id === designer.id) + 1;
                  const percentileCategory = getPercentileCategory(overallRankInFullList, fullDesignerStatsList.length);
                  const IconComponent = getPercentileIcon(percentileCategory);

                  return (
                    <li 
                        key={designer.id} 
                        className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenDesignerDetail(designer)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenDesignerDetail(designer); }}
                        aria-label={`View details for ${designer.name}`}
                    >
                      <span className="text-lg font-medium text-primary w-10 text-center">#{index + 1}</span>
                      <Avatar className="h-10 w-10 mx-4">
                         <AvatarImage src={designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(designer.name)}`} alt={designer.name} data-ai-hint="designer avatar list"/>
                         <AvatarFallback>{getInitials(designer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-semibold text-foreground flex items-center">
                          {designer.name}
                          {designer.isVerified && <SealCheckIcon className="ml-1.5 h-4 w-4 text-blue-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">@{designer.username.startsWith('@') ? designer.username.substring(1) : designer.username}</p>
                      </div>
                      <div className="text-right space-y-0.5 min-w-[160px] sm:min-w-[200px]">
                        <Badge variant="outline" className="text-xs text-primary border-primary">
                           <Star className="h-3 w-3 mr-1 fill-primary" /> Likes: {designer.totalLikes}
                        </Badge>
                        <Badge variant="secondary" className="text-xs ml-2 flex items-center justify-end">
                           {IconComponent} <span className="ml-1">{percentileCategory}</span>
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ) : (
           <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{searchTerm ? "No Designers Found" : "No Designers Available"}</AlertTitle>
            <AlertDescription>
              {searchTerm ? "No designers match your search criteria." : (content.mainPlaceholderContent || "We're waiting for talented designers to join and contribute. Check back soon!")}
            </AlertDescription>
          </Alert>
        )}
      </section>


      {selectedDesignerForDetail && (
        <DesignerDetailDialog
          user={selectedDesignerForDetail}
          isOpen={isDesignerDetailOpen}
          onOpenChange={setIsDesignerDetailOpen}
        />
      )}
    </div>
  );
}

