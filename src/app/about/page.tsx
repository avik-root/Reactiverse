
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers3, Sparkles, Users, Info } from 'lucide-react';
import Image from 'next/image';
import { getPageContentAction } from '@/lib/actions';
import type { AboutUsContent } from '@/lib/types';

export default async function AboutUsPage() {
  const content = await getPageContentAction('aboutUs') as AboutUsContent;

  if (!content) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto py-12 space-y-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
             <Info className="mr-3 h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">{content.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-8">
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-semibold font-headline mb-4">{content.missionTitle}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {content.missionContentP1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {content.missionContentP2}
              </p>
            </div>
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-md">
              <Image 
                src={content.image1Url || "https://placehold.co/600x400.png"} 
                alt={content.image1Alt || "Mission image"} 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg"
                data-ai-hint={content.image1DataAiHint || "team collaboration"}
              />
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold font-headline mb-6">{content.offerTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.offerItems && content.offerItems.map((item, index) => (
                <FeatureCard
                  key={index}
                  icon={index === 0 ? <Layers3 className="h-10 w-10 text-accent" /> : index === 1 ? <Sparkles className="h-10 w-10 text-accent" /> : <Users className="h-10 w-10 text-accent" />}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </section>
        
        <section className="text-center bg-muted/30 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold font-headline mb-4">{content.joinTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                {content.joinContent}
            </p>
             <div className="relative h-40 md:h-52 w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md">
                <Image 
                    src={content.image2Url || "https://placehold.co/600x300.png"} 
                    alt={content.image2Alt || "Community image"} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-lg"
                    data-ai-hint={content.image2DataAiHint || "digital community"}
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
