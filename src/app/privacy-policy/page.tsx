
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { getPageContentAction } from '@/lib/actions';
import type { PrivacyPolicyContent } from '@/lib/types';

export default async function PrivacyPolicyPage() {
  const content = await getPageContentAction('privacyPolicy') as PrivacyPolicyContent | null;

  if (!content) {
    return (
      <div className="container mx-auto py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl font-headline text-primary">
              <ShieldCheck className="mr-3 h-8 w-8" />
              Privacy Policy
            </CardTitle>
            <CardDescription>
              Information about our privacy practices is currently unavailable. Please check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <ShieldCheck className="mr-3 h-8 w-8" />
            {content.title || "Privacy Policy"}
          </CardTitle>
          <CardDescription>
            {content.description || "Our commitment to your privacy."}
            {content.lastUpdated && (
                <span className="block text-xs text-muted-foreground mt-1">Last Updated: {content.lastUpdated}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
          {content.sections && content.sections.length > 0 ? (
            content.sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-semibold font-headline text-foreground !mb-2 !mt-6">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </section>
            ))
          ) : (
            <p className="text-muted-foreground">Privacy policy details are being updated. Please check back soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
