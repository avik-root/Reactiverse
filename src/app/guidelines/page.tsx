
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Lightbulb } from 'lucide-react';
import { getPageContentAction } from '@/lib/actions';
import type { GuidelinesPageContent } from '@/lib/types';

export default async function DesignGuidelinesPage() {
  const content = await getPageContentAction('guidelines') as GuidelinesPageContent;

  if (!content) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <ScrollText className="mr-3 h-8 w-8" />
            {content.title}
          </CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-10 bg-muted/30 rounded-lg">
            <Lightbulb className="h-16 w-16 text-primary/70 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{content.mainPlaceholderTitle}</h3>
            <p className="text-muted-foreground max-w-md">
              {content.mainPlaceholderContent}
            </p>
          </div>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">{content.keyAreasTitle}</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {content.keyAreas && content.keyAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
