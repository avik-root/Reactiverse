
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { User, Design } from '@/lib/types';
import { getAllUsersAdminAction, getAllDesignsAction, getPageContentAction } from '@/lib/actions';
import DesignerCard from '@/components/designer/DesignerCard'; 
import ProfileCard from '@/components/core/ProfileCard'; 
import DesignerDetailDialog from '@/components/designer/DesignerDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Info, Search, Users, ListOrdered, PercentSquare, Crown, Medal, Trophy, Star } from 'lucide-react';
import type { TopDesignersPageContent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SealCheckIcon from '@/components/icons/SealCheckIcon';

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
          getAllUsersAdminAction(),
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
        ...user,
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

  const designersForDisplay = useMemo(() => {
    return displayableDesignerStatsList
      .filter(d => d.totalLikes > 0 || d.totalDesignsUploaded > 0)
      .slice(0, 20); // Get top 20 active designers
  }, [displayableDesignerStatsList]);

  const top3Designers = useMemo(() => {
    return designersForDisplay.slice(0, 3);
  }, [designersForDisplay]);

  const designersRank4to10 = useMemo(() => {
    return designersForDisplay.slice(3, 10); // Ranks 4 through 10
  }, [designersForDisplay]);

  const designersRank11to20 = useMemo(() => {
    return designersForDisplay.slice(10, 20); // Ranks 11 through 20
  }, [designersForDisplay]);


  const handleOpenDesignerDetail = (designer: DesignerStats) => {
    setSelectedDesignerForDetail(designer);
    setIsDesignerDetailOpen(true);
  };

  const getPercentileCategory = (rank: number, total: number): string => {
    if (total === 0 || rank === 0) return "Contributor";
    const percentile = ((total - rank + 1) / total) * 100;
    if (percentile >= 90) return "Top 10% Elite";
    if (percentile >= 75) return "Top 25% Pro";
    if (percentile >= 50) return "Top 50% Creator";
    return "Valued Contributor";
  };
  
  const getPercentileIcon = (category: string) => {
    if (category.includes("Elite")) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (category.includes("Pro")) return <Trophy className="h-4 w-4 text-orange-400" />;
    if (category.includes("Creator")) return <Medal className="h-4 w-4 text-sky-400" />;
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
                <div key={i} className="p-6 border rounded-lg bg-card space-y-3 flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3 mt-1" />
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

  const noTopRankedToShow = top3Designers.length === 0 && designersRank4to10.length === 0 && designersRank11to20.length === 0;

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
        {noTopRankedToShow ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{searchTerm ? "No Designers Found" : "No Designers with Activity Yet"}</AlertTitle>
            <AlertDescription>
              {searchTerm ? "No designers match your current search criteria or they have no likes/uploads." : "Be the first to like some designs, or encourage designers to share their work!"}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Podium Layout for Top 3 */}
            {top3Designers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-6 gap-y-8 items-end mb-12 justify-items-center">
                {/* Rank 1 - Center on MD, First on SM */}
                {top3Designers[0] && (
                  <div className="w-full md:order-2 z-10 flex justify-center">
                    <ProfileCard
                      avatarUrl={top3Designers[0].avatarUrl || `https://placehold.co/128x128.png?text=${getInitials(top3Designers[0].name)}`}
                      name={top3Designers[0].name}
                      title={getPercentileCategory(1, fullDesignerStatsList.length)}
                      handle={top3Designers[0].username.startsWith('@') ? top3Designers[0].username.substring(1) : top3Designers[0].username}
                      status={`Likes: ${top3Designers[0].totalLikes} | Designs: ${top3Designers[0].totalDesignsUploaded}`}
                      contactText="View Profile"
                      onContactClick={() => handleOpenDesignerDetail(top3Designers[0])}
                      showUserInfo={true}
                      enableTilt={true}
                      miniAvatarUrl={top3Designers[0].avatarUrl}
                      rank={1}
                      className="transform md:scale-110 shadow-2xl"
                    />
                  </div>
                )}

                {/* Rank 2 - Left on MD, Second on SM */}
                {top3Designers[1] && (
                  <div className="w-full md:order-1 md:mt-12 flex justify-center">
                    <ProfileCard
                      avatarUrl={top3Designers[1].avatarUrl || `https://placehold.co/128x128.png?text=${getInitials(top3Designers[1].name)}`}
                      name={top3Designers[1].name}
                      title={getPercentileCategory(2, fullDesignerStatsList.length)}
                      handle={top3Designers[1].username.startsWith('@') ? top3Designers[1].username.substring(1) : top3Designers[1].username}
                      status={`Likes: ${top3Designers[1].totalLikes} | Designs: ${top3Designers[1].totalDesignsUploaded}`}
                      contactText="View Profile"
                      onContactClick={() => handleOpenDesignerDetail(top3Designers[1])}
                      showUserInfo={true}
                      enableTilt={true}
                      miniAvatarUrl={top3Designers[1].avatarUrl}
                      rank={2}
                    />
                  </div>
                )}
                
                {/* Fill empty grid cell if only 1 designer in top 3 */}
                {top3Designers.length === 1 && <div className="w-full md:order-1 hidden md:block"></div> }


                {/* Rank 3 - Right on MD, Third on SM */}
                {top3Designers[2] && (
                  <div className="w-full md:order-3 md:mt-12 flex justify-center">
                    <ProfileCard
                      avatarUrl={top3Designers[2].avatarUrl || `https://placehold.co/128x128.png?text=${getInitials(top3Designers[2].name)}`}
                      name={top3Designers[2].name}
                      title={getPercentileCategory(3, fullDesignerStatsList.length)}
                      handle={top3Designers[2].username.startsWith('@') ? top3Designers[2].username.substring(1) : top3Designers[2].username}
                      status={`Likes: ${top3Designers[2].totalLikes} | Designs: ${top3Designers[2].totalDesignsUploaded}`}
                      contactText="View Profile"
                      onContactClick={() => handleOpenDesignerDetail(top3Designers[2])}
                      showUserInfo={true}
                      enableTilt={true}
                      miniAvatarUrl={top3Designers[2].avatarUrl}
                      rank={3}
                    />
                  </div>
                )}
                 {/* Fill empty grid cell if only 1 or 2 designers in top 3 */}
                 {top3Designers.length <= 2 && <div className="w-full md:order-3 hidden md:block"></div> }
              </div>
            )}

            {/* Grid for Ranks 4-10 */}
            {designersRank4to10.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 mt-12">
                {designersRank4to10.map((designer, index) => {
                  const rank = 3 + index + 1; // Rank starts from 4
                  const percentileCategory = getPercentileCategory(rank, fullDesignerStatsList.length);
                  return (
                    <div key={designer.id} className="pc-card-wrapper-container">
                      <ProfileCard
                        avatarUrl={designer.avatarUrl || `https://placehold.co/128x128.png?text=${getInitials(designer.name)}`}
                        name={designer.name}
                        title={percentileCategory}
                        handle={designer.username.startsWith('@') ? designer.username.substring(1) : designer.username}
                        status={`Likes: ${designer.totalLikes} | Designs: ${designer.totalDesignsUploaded}`}
                        contactText="View Profile"
                        onContactClick={() => handleOpenDesignerDetail(designer)}
                        showUserInfo={true}
                        enableTilt={true}
                        miniAvatarUrl={designer.avatarUrl}
                        rank={rank}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grid for Ranks 11-20 */}
            {designersRank11to20.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 mt-12">
                {designersRank11to20.map((designer, index) => {
                  const rank = 10 + index + 1; // Rank starts from 11
                  return (
                    <DesignerCard
                      key={designer.id}
                      user={designer}
                      rank={rank}
                      highlightMetricLabel="Total Likes"
                      highlightMetricValue={designer.totalLikes}
                      onOpenDetail={() => handleOpenDesignerDetail(designer)}
                    />
                  );
                })}
              </div>
            )}
          </>
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

