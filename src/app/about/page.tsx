
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers3, Sparkles, Users, Info, Mail, Github, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPageContentAction } from '@/lib/actions';
import type { AboutUsContent, TeamMembersContent, TeamMember } from '@/lib/types';


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

const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

interface TeamMemberDisplayCardProps {
  member: TeamMember;
}

function TeamMemberDisplayCard({ member }: TeamMemberDisplayCardProps) {
  return (
    <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow w-full max-w-md mx-auto">
      <div className="relative w-32 h-40 mb-4 border-4 border-primary rounded-md overflow-hidden shadow-md">
        <Image
          key={member.imageUrl}
          src={member.imageUrl || `https://placehold.co/128x160.png?text=${getInitials(member.name)}`}
          alt={member.imageAlt || member.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={member.imageDataAiHint || "profile photo"}
        />
      </div>
      <CardTitle className="text-2xl font-headline text-primary mb-1">{member.name}</CardTitle>
      <p className="text-md text-accent font-semibold mb-3">{member.title}</p>
      <CardDescription className="text-sm text-muted-foreground mb-4 whitespace-pre-line text-left max-h-48 overflow-y-auto">
        {member.bio}
      </CardDescription>
      <div className="flex space-x-4 mt-auto pt-4">
        {member.emailAddress && (
          <Link href={`mailto:${member.emailAddress}`} target="_blank" rel="noopener noreferrer" aria-label={`Email ${member.name}`}>
            <Mail className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        )}
        {member.githubUrl && (
          <Link href={member.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub profile`}>
            <Github className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        )}
        {member.linkedinUrl && (
          <Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn profile`}>
            <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        )}
      </div>
    </Card>
  );
}


export default async function AboutUsPage() {
  const aboutContent = await getPageContentAction('aboutUs') as AboutUsContent;
  const teamContent = await getPageContentAction('teamMembers') as TeamMembersContent;

  if (!aboutContent || !teamContent) {
    return <div className="container mx-auto py-12">Error loading content. Please try again later.</div>;
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-items-center">
                <TeamMemberDisplayCard member={teamContent.founder} />
                <TeamMemberDisplayCard member={teamContent.coFounder} />
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

