
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getPageContentAction } from '@/lib/actions';
import type { SupportPageContent } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default async function SupportPage() {
  const content = await getPageContentAction('support') as SupportPageContent;

  if (!content) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <LifeBuoy className="mr-3 h-8 w-8" />
            {content.title}
          </CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-headline text-primary">
                    <Mail className="mr-2 h-6 w-6" /> {content.emailSupportTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{content.emailSupportDescription}</p>
                  <Button asChild variant="outline">
                    <Link href={`mailto:${content.emailAddress}`}>{content.emailAddress}</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-headline text-primary">
                    <MessageSquare className="mr-2 h-6 w-6" /> {content.forumTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{content.forumDescription}</p>
                  <Button asChild variant="outline" disabled={content.forumLinkUrl === '#'}>
                    <Link href={content.forumLinkUrl || '#'}>{content.forumLinkText}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4">{content.faqTitle}</h2>
            {content.faqs && content.faqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {content.faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:text-accent">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="space-y-4 text-center py-6 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No frequently asked questions have been added yet. Please check back later!</p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

