
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, Info } from 'lucide-react';
import { getPageContentAction, getAllUsersAdminAction } from '@/lib/actions';
import type { TopDesignersPageContent, User } from '@/lib/types';
import DesignerCard from '@/components/designer/DesignerCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function TopDesignersPage() {
  const contentPromise = getPageContentAction('topDesigners') as Promise<TopDesignersPageContent>;
  const usersPromise = getAllUsersAdminAction();

  const [content, users] = await Promise.all([contentPromise, usersPromise]);

  if (!content) {
    return <div className="container mx-auto py-12">Error loading page content. Please try again later.</div>;
  }
  
  const designers = users.filter(user => !user.id.startsWith('admin-')); // Filter out any potential admin users if they were in users.json

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
          {designers && designers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {designers.map((designer) => (
                <DesignerCard key={designer.id} user={designer} />
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{content.mainPlaceholderTitle || "No Designers Yet"}</AlertTitle>
              <AlertDescription>
                {content.mainPlaceholderContent || "We're waiting for talented designers to join our community. Check back soon!"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
