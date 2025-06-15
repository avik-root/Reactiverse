
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, Info, Heart } from 'lucide-react';
import { getPageContentAction, getAllUsersAdminAction, getAllDesignsAction } from '@/lib/actions';
import type { TopDesignersPageContent, User, Design } from '@/lib/types';
import DesignerCard from '@/components/designer/DesignerCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DesignerWithLikeCount extends User {
  totalLikeCount: number;
}

export default async function DesignersPage() {
  const contentPromise = getPageContentAction('topDesigners') as Promise<TopDesignersPageContent>;
  const usersPromise = getAllUsersAdminAction();
  const designsPromise = getAllDesignsAction();

  const [content, users, allDesigns] = await Promise.all([contentPromise, usersPromise, designsPromise]);

  if (!content) {
    return <div className="container mx-auto py-12">Error loading page content. Please try again later.</div>;
  }

  // Calculate total like count for each designer
  const designersWithLikeCount: DesignerWithLikeCount[] = users
    .filter(user => !user.id.startsWith('admin-')) // Filter out admin users
    .map(designer => {
      const designerDesigns = allDesigns.filter(design => design.submittedByUserId === designer.id);
      const totalLikeCount = designerDesigns.reduce((sum, design) => sum + (design.likedBy?.length || 0), 0);
      return { ...designer, totalLikeCount };
    })
    .filter(designer => designer.totalLikeCount > 0) // Only include designers with more than 0 likes
    .sort((a, b) => b.totalLikeCount - a.totalLikeCount); // Sort by total like count descending

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Award className="mr-3 h-8 w-8" />
            {content.title}
          </CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {designersWithLikeCount && designersWithLikeCount.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {designersWithLikeCount.map((designer, index) => (
                <DesignerCard key={designer.id} user={designer} totalLikeCount={designer.totalLikeCount} rank={index + 1} />
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{content.mainPlaceholderTitle || "No Top Designers Yet"}</AlertTitle>
              <AlertDescription>
                {content.mainPlaceholderContent || "We're waiting for talented designers to get some likes on their contributions. Check back soon!"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

