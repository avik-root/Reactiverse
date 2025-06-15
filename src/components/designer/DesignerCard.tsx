
'use client';

import type { User } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardContent as it's not directly used
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign, Github, Linkedin, Mail, Award, Heart } from 'lucide-react'; // Added Heart
import FigmaIcon from '@/components/icons/FigmaIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DesignerCardProps {
  user: User;
  totalLikeCount?: number; // Changed from totalCopyCount
  rank?: number;
}

const getInitials = (name?: string) => {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const DesignerCard: React.FC<DesignerCardProps> = ({ user, totalLikeCount, rank }) => {
  const { toast } = useToast();

  const handleCopyEmail = () => {
    if (user.email && user.isEmailPublic) {
      navigator.clipboard.writeText(user.email)
        .then(() => {
          toast({ title: "Email Copied!", description: `${user.name}'s email copied to clipboard.` });
        })
        .catch(err => {
          console.error("Failed to copy email: ", err);
          toast({ title: "Error", description: "Failed to copy email.", variant: "destructive" });
        });
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col items-center text-center p-6 bg-card h-full relative">
      {rank && (
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shadow-md">
          <Award className="h-4 w-4 mr-0.5"/> #{rank}
        </div>
      )}
      <Avatar className="w-24 h-24 mt-8 mb-4 border-2 border-primary shadow-sm">
        <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="designer avatar" />
        <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <CardTitle className="text-2xl font-headline text-primary mb-1">{user.name}</CardTitle>
      <CardDescription className="text-accent font-medium flex items-center mb-1">
        <AtSign className="h-4 w-4 mr-1" />
        {user.username.startsWith('@') ? user.username.substring(1) : user.username}
      </CardDescription>
      {totalLikeCount !== undefined && (
        <p className="text-xs text-muted-foreground mb-3 flex items-center">
          <Heart className="h-3.5 w-3.5 mr-1 text-red-500 fill-current" />
          Total Likes: <span className="font-semibold text-foreground ml-1">{totalLikeCount}</span>
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2 mt-auto pt-3 border-t w-full">
        {user.githubUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={user.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${user.name}'s Github`}>
                    <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>GitHub</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {user.linkedinUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${user.name}'s LinkedIn`}>
                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>LinkedIn</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {user.figmaUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={user.figmaUrl} target="_blank" rel="noopener noreferrer" aria-label={`${user.name}'s Figma`}>
                    <FigmaIcon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Figma</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {user.email && user.isEmailPublic && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopyEmail} aria-label={`Copy ${user.name}'s Email`}>
                  <Mail className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Email</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Card>
  );
};

export default DesignerCard;
