

'use client';

import type { User } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign, Github, Linkedin, Mail, Palette, BadgePercent, Star, CheckCircle, Crown, Trophy, Medal } from 'lucide-react';
import FigmaIcon from '@/components/icons/FigmaIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface DesignerCardProps {
  user: User;
  rank?: number;
  highlightMetricLabel?: string;
  highlightMetricValue?: number | string;
  onOpenDetail: () => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const DesignerCard: React.FC<DesignerCardProps> = ({ user, rank, highlightMetricLabel, highlightMetricValue, onOpenDetail }) => {
  const { toast } = useToast();

  const handleCopyEmail = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const RankingBadge = () => {
    if (!rank || rank > 3) {
      return rank ? ( // Only show generic star if rank is provided and > 3
        <Badge variant="secondary" className="absolute top-3 left-3 text-sm px-2.5 py-1 bg-primary/20 text-primary font-bold border-primary/50">
          <Star className="h-4 w-4 mr-1.5 fill-primary text-primary" /> #{rank}
        </Badge>
      ) : null;
    }

    let icon = <Star className="h-4 w-4 mr-1.5" />;
    let colorClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 fill-yellow-500"; // Gold
    if (rank === 2) {
      icon = <Trophy className="h-4 w-4 mr-1.5" />; // Silver
      colorClass = "bg-slate-400/20 text-slate-500 border-slate-400/50 fill-slate-500";
    } else if (rank === 3) {
      icon = <Medal className="h-4 w-4 mr-1.5" />; // Bronze
      colorClass = "bg-orange-400/20 text-orange-500 border-orange-400/50 fill-orange-500";
    } else if (rank === 1) {
      icon = <Crown className="h-4 w-4 mr-1.5" />;
    }
     const clonedIcon = React.cloneElement(icon, { className: `h-4 w-4 mr-1.5 ${rank === 1 ? 'fill-yellow-500' : rank === 2 ? 'fill-slate-500' : rank === 3 ? 'fill-orange-500' : ''}` });


    return (
      <Badge variant="secondary" className={`absolute top-3 left-3 text-sm px-2.5 py-1 font-bold ${colorClass}`}>
        {clonedIcon} #{rank}
      </Badge>
    );
  };


  return (
    <Card 
      className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col items-center text-center p-6 bg-card h-full relative cursor-pointer"
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(); }}
      aria-label={`View details for ${user.name}`}
    >
      <RankingBadge />
      <Avatar className="w-24 h-24 mt-4 mb-4 border-2 border-primary shadow-sm">
        <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="designer avatar" />
        <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <CardTitle className="text-2xl font-headline text-primary mb-1 flex items-center">
        {user.name}
        {user.isVerified && <CheckCircle className="ml-2 h-5 w-5 text-blue-500 fill-blue-500" />}
      </CardTitle>
      <CardDescription className="text-accent font-medium flex items-center mb-2">
        <AtSign className="h-4 w-4 mr-1" />
        {user.username.startsWith('@') ? user.username.substring(1) : user.username}
      </CardDescription>
      
      {highlightMetricLabel && highlightMetricValue !== undefined && (
        <div className="mb-3 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{highlightMetricLabel}:</span> {highlightMetricValue}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-auto pt-3 border-t w-full">
        {user.githubUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
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
                <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
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
                <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
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

