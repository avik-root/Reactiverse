
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <LifeBuoy className="mr-3 h-8 w-8" />
            Support Center
          </CardTitle>
          <CardDescription>Need help? We&apos;re here for you. Find answers or get in touch with our support team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-headline text-primary">
                    <Mail className="mr-2 h-6 w-6" /> Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">Get in touch via email for any inquiries.</p>
                  <Button asChild variant="outline">
                    <Link href="mailto:support@reactiverse.com">support@reactiverse.com</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-headline text-primary">
                    <MessageSquare className="mr-2 h-6 w-6" /> Community Forum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">Ask questions and find answers in our community.</p>
                  <Button asChild variant="outline" disabled>
                    <Link href="#">Visit Forum (Coming Soon)</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4 text-center py-6 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Our FAQ section is under construction.</p>
                <p className="text-sm text-muted-foreground">Please check back later for common questions and answers!</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
