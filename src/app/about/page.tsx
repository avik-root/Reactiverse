
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers3, Sparkles, Users, Info } from 'lucide-react'; // Removed Github, Linkedin, Mail as ProfileCard handles contact
import Image from 'next/image';
import Link from 'next/link';
import { getPageContentAction } from '@/lib/actions';
import type { AboutUsContent, TeamMembersContent, TeamMember } from '@/lib/types';
import ProfileCard from '@/components/core/ProfileCard'; // Import the new ProfileCard

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

// TeamMemberCard is no longer needed as ProfileCard replaces it.

export default async function AboutUsPage() {
  const aboutContent = await getPageContentAction('aboutUs') as AboutUsContent;
  const teamContent = await getPageContentAction('teamMembers') as TeamMembersContent;

  if (!aboutContent || !teamContent) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
  }
  
  const generateHandle = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  }

  return (
    <div className="container mx-auto py-12 space-y-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
             <Info className="mr-3 h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">{aboutContent.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutContent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-8">
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-semibold font-headline mb-4">{aboutContent.missionTitle}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {aboutContent.missionContentP1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {aboutContent.missionContentP2}
              </p>
            </div>
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-md">
              <Image 
                src={aboutContent.image1Url || "https://placehold.co/600x400.png"} 
                alt={aboutContent.image1Alt || "Mission image"} 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg"
                data-ai-hint={aboutContent.image1DataAiHint || "team collaboration"}
                key={aboutContent.image1Url} 
              />
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold font-headline mb-6">{aboutContent.offerTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutContent.offerItems && aboutContent.offerItems.map((item, index) => (
                <FeatureCard
                  key={index}
                  icon={index === 0 ? <Layers3 className="h-10 w-10 text-accent" /> : index === 1 ? <Sparkles className="h-10 w-10 text-accent" /> : <Users className="h-10 w-10 text-accent" />}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </section>

          {teamContent.founder && teamContent.coFounder && (
            <section className="text-center space-y-8">
              <h2 className="text-3xl font-semibold font-headline mb-6">{teamContent.title || "Meet Our Team"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                <div className="pc-card-wrapper-container">
                  <ProfileCard
                    avatarUrl={teamContent.founder.imageUrl || "https://placehold.co/128x128.png?text=F"}
                    name={teamContent.founder.name}
                    title={teamContent.founder.title}
                    handle={generateHandle(teamContent.founder.name)}
                    status={teamContent.founder.title} // Or a generic "Online" / Role
                    contactText={`Email ${teamContent.founder.name.split(' ')[0]}`}
                    onContactClick={() => {
                        if (typeof window !== 'undefined' && teamContent.founder.emailAddress) {
                            window.location.href = `mailto:${teamContent.founder.emailAddress}`;
                        }
                    }}
                    showUserInfo={true}
                    enableTilt={true}
                    miniAvatarUrl={teamContent.founder.imageUrl}
                    // You can pass grainUrl, iconUrl if you have them
                  />
                </div>
                <div className="pc-card-wrapper-container">
                  <ProfileCard
                    avatarUrl={teamContent.coFounder.imageUrl || "https://placehold.co/128x128.png?text=C"}
                    name={teamContent.coFounder.name}
                    title={teamContent.coFounder.title}
                    handle={generateHandle(teamContent.coFounder.name)}
                    status={teamContent.coFounder.title}
                    contactText={`Email ${teamContent.coFounder.name.split(' ')[0]}`}
                     onContactClick={() => {
                        if (typeof window !== 'undefined' && teamContent.coFounder.emailAddress) {
                            window.location.href = `mailto:${teamContent.coFounder.emailAddress}`;
                        }
                    }}
                    showUserInfo={true}
                    enableTilt={true}
                    miniAvatarUrl={teamContent.coFounder.imageUrl}
                  />
                </div>
              </div>
               <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-semibold text-primary">Founder Bio:</p>
                <p className="whitespace-pre-line">{teamContent.founder.bio}</p>
                <p className="font-semibold text-primary mt-2">Co-Founder Bio:</p>
                <p className="whitespace-pre-line">{teamContent.coFounder.bio}</p>
              </div>
            </section>
          )}
        
          <section className="text-center bg-muted/30 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold font-headline mb-4">{aboutContent.joinTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                {aboutContent.joinContent}
            </p>
             <div className="relative h-40 md:h-52 w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md">
                <Image 
                    src={aboutContent.image2Url || "https://placehold.co/600x300.png"} 
                    alt={aboutContent.image2Alt || "Community image"} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-lg"
                    data-ai-hint={aboutContent.image2DataAiHint || "digital community"}
                    key={aboutContent.image2Url} 
                 />
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
