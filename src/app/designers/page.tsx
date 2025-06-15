
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { User, Design } from '@/lib/types';
import { getAllUsersAdminAction, getAllDesignsAction, getPageContentAction } from '@/lib/actions';
import DesignerCard from '@/components/designer/DesignerCard';
import DesignerDetailDialog from '@/components/designer/DesignerDetailDialog'; // New Import
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Info, Search } from 'lucide-react';
import type { TopDesignersPageContent } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface DesignerWithContributionCount extends User {
  totalDesignsUploaded: number;
}

export default function DesignersPage() {
  const [content, setContent] = useState<TopDesignersPageContent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allDesigns, setAllDesigns] = useState<Design[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedDesignerForDetail, setSelectedDesignerForDetail] = useState<DesignerWithContributionCount | null>(null);
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
        setUsers(fetchedUsers);
        setAllDesigns(designsData);
      } catch (error) {
        console.error("Error fetching data for Designers page:", error);
        setContent(null);
      }
      setIsLoading(false);
    }
    fetchAllData();
  }, []);

  const designersWithContributionCount = useMemo(() => {
    if (!users.length || !allDesigns) return [];

    const designersWithCounts: DesignerWithContributionCount[] = users
      .filter(user => !user.id.startsWith('admin-'))
      .map(designer => {
        const designsByThisUser = allDesigns.filter(design => design.submittedByUserId === designer.id);
        return {
          ...designer,
          totalDesignsUploaded: designsByThisUser.length,
        };
      });

    designersWithCounts.sort((a, b) => {
      if (b.totalDesignsUploaded !== a.totalDesignsUploaded) {
        return b.totalDesignsUploaded - a.totalDesignsUploaded;
      }
      return a.name.localeCompare(b.name);
    });
    return designersWithCounts;
  }, [users, allDesigns]);

  const filteredAndSortedDesigners = useMemo(() => {
    if (!designersWithContributionCount.length) return [];
    if (!searchTerm) return designersWithContributionCount;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return designersWithContributionCount.filter(
      designer =>
        designer.name.toLowerCase().includes(lowerSearchTerm) ||
        designer.username.toLowerCase().includes(lowerSearchTerm)
    );
  }, [designersWithContributionCount, searchTerm]);

  const handleOpenDesignerDetail = (designer: DesignerWithContributionCount) => {
    setSelectedDesignerForDetail(designer);
    setIsDesignerDetailOpen(true);
  };

  if (isLoading || !content) {
    return (
      <div className="container mx-auto py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4" />
             <div className="mt-4">
                <Skeleton className="h-10 w-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-6 border rounded-lg bg-card space-y-3">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                   <div className="flex justify-center gap-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
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
        <CardContent className="space-y-6">
          {filteredAndSortedDesigners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedDesigners.map((designer) => (
                <DesignerCard
                  key={designer.id}
                  user={designer}
                  onOpenDetail={() => handleOpenDesignerDetail(designer)}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{searchTerm ? "No Designers Found" : (content.mainPlaceholderTitle || "No Designers Yet")}</AlertTitle>
              <AlertDescription>
                {searchTerm ? "No designers match your search criteria. Try a different term." : (content.mainPlaceholderContent || "We're waiting for talented designers to join and contribute. Check back soon!")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedDesignerForDetail && (
        <DesignerDetailDialog
          user={selectedDesignerForDetail}
          totalDesignsUploaded={selectedDesignerForDetail.totalDesignsUploaded}
          isOpen={isDesignerDetailOpen}
          onOpenChange={setIsDesignerDetailOpen}
        />
      )}
    </div>
  );
}
