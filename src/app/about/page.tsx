
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Layers3, Sparkles, Users, Info } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
             <Info className="mr-3 h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">About Reactiverse</CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering designers and developers to share, discover, and implement stunning UI components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-8">
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-semibold font-headline mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At Reactiverse, our mission is to foster a vibrant community where creativity thrives. We provide a platform for UI/UX designers and front-end developers to showcase their innovative components, share knowledge, and inspire one another. We believe in the power of open collaboration to push the boundaries of web design and development.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you&apos;re looking for inspiration, ready-to-use code snippets, or a place to share your own masterpieces, Reactiverse is your go-to destination.
              </p>
            </div>
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-md">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Collaborative design process" 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg"
                data-ai-hint="collaboration team" 
              />
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold font-headline mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Layers3 className="h-10 w-10 text-accent" />}
                title="Diverse Component Showcase"
                description="Explore a vast collection of UI components, from simple buttons to complex interactive elements."
              />
              <FeatureCard
                icon={<Sparkles className="h-10 w-10 text-accent" />}
                title="Inspiration Hub"
                description="Discover new design trends, techniques, and get inspired by the work of talented creators."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-accent" />}
                title="Community Driven"
                description="Connect with fellow designers, share feedback, and contribute to a growing ecosystem of creativity."
              />
            </div>
          </section>
        
        <section className="text-center bg-muted/30 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold font-headline mb-4">Join Our Universe</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Reactiverse is more than just a platform; it&apos;s a community. We invite you to join us, share your work, learn from others, and help build the future of UI design.
            </p>
             <div className="relative h-40 md:h-52 w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md">
                <Image 
                    src="https://placehold.co/600x300.png" 
                    alt="Community of designers" 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-lg"
                    data-ai-hint="community digital"
                 />
            </div>
        </section>

        </CardContent>
      </Card>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-card">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold font-headline mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
