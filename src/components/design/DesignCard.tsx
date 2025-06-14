'use client';

import type { Design } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Lock } from 'lucide-react';

interface DesignCardProps {
  design: Design;
  onOpenDetail: (design: Design) => void;
}

const DesignCard: React.FC<DesignCardProps> = ({ design, onOpenDetail }) => {

  const getInitials = (name?: string) => {
    if (!name) return 'D'; // Default for Designer
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = design.price && design.price > 0;

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer h-full flex flex-col rounded-lg"
      onClick={() => onOpenDetail(design)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(design)}}
      aria-label={`View details for ${design.title}`}
    >
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={design.imageUrl}
            alt={design.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="design abstract"
          />
        </div>
        {isPriced && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
            <DollarSign className="h-3 w-3 mr-1" /> Priced
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1 text-primary">{design.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{design.description}</CardDescription>
        <div className="mt-3 flex flex-wrap gap-1">
          {design.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={design.designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(design.designer.name)}`} alt={design.designer.name} data-ai-hint="designer avatar" />
            <AvatarFallback>{getInitials(design.designer.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{design.designer.name}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DesignCard;
