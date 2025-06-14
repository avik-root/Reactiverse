
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CommunityForumPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <MessagesSquare className="mr-3 h-8 w-8" />
            Community Forum
          </CardTitle>
          <CardDescription>Connect with other designers, ask questions, and share your insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center justify-center text-center py-12 bg-muted/30 rounded-lg">
            <MessagesSquare className="h-20 w-20 text-primary/60 mb-6 animate-pulse" />
            <h3 className="text-2xl font-semibold mb-3">Our Forum is Brewing!</h3>
            <p className="text-muted-foreground max-w-lg mb-6">
              We&apos;re working hard to build a vibrant and supportive community space. 
              Soon, you&apos;ll be able to join discussions, seek advice, and collaborate with fellow Reactiverse members.
            </p>
            <p className="text-sm text-accent">Stay tuned for updates!</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold font-headline">What to Expect:</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>Dedicated channels for different design topics.</li>
              <li>Showcase your work-in-progress and get feedback.</li>
              <li>Q&A sections for technical and design challenges.</li>
              <li>Announcements and updates from the Reactiverse team.</li>
            </ul>
          </div>
           <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Want to be notified when it launches?</h3>
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <Input type="email" placeholder="Enter your email" className="flex-grow" disabled/>
                    <Button type="submit" disabled>Notify Me</Button>
                </form>
                 <p className="text-xs text-muted-foreground text-center mt-2">Sign up for our newsletter (feature coming soon).</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
