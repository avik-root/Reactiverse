
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
            {content.title || "Design Guidelines"}
          </CardTitle>
          <CardDescription>{content.description || "Our principles and best practices for submitting designs."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Main Placeholder Section */}
          {(content.mainPlaceholderTitle || content.mainPlaceholderContent) && (
            <section className="p-6 bg-muted/30 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <Lightbulb className="h-12 w-12 text-primary/70 mb-4" />
                {content.mainPlaceholderTitle && (
                  <h3 className="text-2xl font-semibold font-headline mb-2">{content.mainPlaceholderTitle}</h3>
                )}
                {content.mainPlaceholderContent && (
                  <p className="text-muted-foreground max-w-prose mx-auto">
                    {content.mainPlaceholderContent}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Key Areas Section */}
          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4">
              {content.keyAreasTitle || "Key Areas We'll Cover:"}
            </h2>
            {content.keyAreas && content.keyAreas.length > 0 ? (
              <ul className="list-disc list-inside space-y-3 text-muted-foreground pl-5">
                {content.keyAreas.map((area, index) => (
                  <li key={index} className="leading-relaxed text-base">
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Details on key areas will be provided soon.</p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
