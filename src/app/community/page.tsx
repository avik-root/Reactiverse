
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare, Search, Lightbulb, Users, Palette, HelpCircle, Megaphone, Code2 } from 'lucide-react';
import Link from 'next/link';

interface ForumCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  disabled?: boolean;
}

function ForumCategoryCard({ icon, title, description, link, disabled }: ForumCategoryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow bg-card hover:bg-muted/50">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
        <div className="bg-primary/10 p-3 rounded-lg text-primary">
          {icon}
        </div>
        <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="w-full" disabled={disabled}>
          <Link href={disabled ? '#' : link}>
            {disabled ? "Coming Soon" : "View Topics"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const forumCategories: ForumCategoryCardProps[] = [
  {
    icon: <MessagesSquare className="h-6 w-6" />,
    title: "General Discussion",
    description: "Talk about anything related to UI/UX design, development, and Reactiverse.",
    link: "#",
    disabled: true,
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Showcase & Feedback",
    description: "Share your latest designs and get constructive feedback from the community.",
    link: "#",
    disabled: true,
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "Coding & Technical Help",
    description: "Stuck on a problem? Ask for help with HTML, CSS, JavaScript, React, or other tech.",
    link: "#",
    disabled: true,
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Ideas & Feature Requests",
    description: "Have an idea for Reactiverse or a component? Share it here!",
    link: "#",
    disabled: true,
  },
  {
    icon: <Megaphone className="h-6 w-6" />,
    title: "Announcements",
    description: "Stay updated with the latest news and announcements from the Reactiverse team.",
    link: "#",
    disabled: true,
  },
   {
    icon: <HelpCircle className="h-6 w-6" />,
    title: "Support & Q/A",
    description: "Got questions about using Reactiverse? Find answers and support.",
    link: "#",
    disabled: true,
  },
];

export default function CommunityForumPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Users className="mr-3 h-8 w-8" />
            Community Forum
          </CardTitle>
          <CardDescription>Connect, share, and learn with fellow designers and developers in the Reactiverse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search forum topics (coming soon)..."
              className="pl-10 w-full"
              disabled
            />
          </div>

          <section>
            <h2 className="text-2xl font-semibold font-headline mb-6 text-center">Explore Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forumCategories.map((category) => (
                <ForumCategoryCard key={category.title} {...category} />
              ))}
            </div>
          </section>

          <section className="text-center py-8 bg-muted/30 rounded-lg">
            <MessagesSquare className="h-16 w-16 text-primary/60 mb-4 mx-auto animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Our Forum is Under Construction!</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-4">
              We&apos;re actively building this space for you to connect. Full forum functionality, including posting and replying, is coming soon.
            </p>
            <p className="text-sm text-accent">Thank you for your patience and stay tuned for exciting updates!</p>
          </section>
          
           <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-3 text-center">Want to be notified when full features launch?</h3>
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <Input type="email" placeholder="Enter your email" className="flex-grow" disabled/>
                    <Button type="submit" disabled>Notify Me</Button>
                </form>
                 <p className="text-xs text-muted-foreground text-center mt-2">Newsletter signup (feature coming soon).</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
