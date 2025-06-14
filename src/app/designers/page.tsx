
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award } from 'lucide-react';
import { getPageContentAction } from '@/lib/actions';
import type { TopDesignersPageContent } from '@/lib/types';

export default async function TopDesignersPage() {
  const content = await getPageContentAction('topDesigners') as TopDesignersPageContent;

  if (!content) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
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
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-10 bg-muted/30 rounded-lg">
            <Users className="h-16 w-16 text-primary/70 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{content.mainPlaceholderTitle}</h3>
            <p className="text-muted-foreground max-w-md">
              {content.mainPlaceholderContent}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
