
'use client';

import type { Design } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Filter, Code2 } from 'lucide-react'; 
import { useMemo } from 'react';

interface DesignCardProps {
  design: Design;
  onOpenDetail: (design: Design) => void;
}

const DesignCard: React.FC<DesignCardProps> = ({ design, onOpenDetail }) => {

  const getInitials = (name?: string) => {
    if (!name) return 'D'; 
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = design.price && design.price > 0;

  const htmlPreviewContent = useMemo(() => {
    if (isPriced) return null; // No preview for priced items on card
    const htmlBlock = design.codeBlocks.find(block => block.language.toLowerCase() === 'html');
    return htmlBlock ? htmlBlock.code : null;
  }, [design.codeBlocks, isPriced]);

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer h-full flex flex-col rounded-lg"
      onClick={() => onOpenDetail(design)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(design)}}
      aria-label={`View details for ${design.title}`}
    >
      <CardHeader className="p-0 relative bg-muted/30 flex items-center justify-center aspect-[16/9] min-h-[150px] overflow-hidden">
        {htmlPreviewContent ? (
          <div className="w-full h-full transform scale-[0.35] origin-center flex items-center justify-center pointer-events-none">
            <iframe
              srcDoc={`<html><head><style>body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; background-color: transparent; } * { color: hsl(var(--foreground)) !important; }</style></head><body>${htmlPreviewContent}</body></html>`}
              title={`${design.title} card preview`}
              sandbox="allow-same-origin" // Minimal sandbox for static HTML
              className="w-[calc(100%/0.35)] h-[calc(100%/0.35)] border-0 overflow-hidden bg-transparent"
              scrolling="no"
            />
          </div>
        ) : (
          <Code2 className="h-16 w-16 text-primary/70" />
        )}
        {isPriced && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs px-2 py-1 flex items-center z-10">
            <IndianRupee className="h-3 w-3 mr-1" />
            {design.price?.toFixed(2)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1 text-primary">{design.title}</CardTitle>
        {design.filterCategory && (
            <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Filter className="h-3 w-3 mr-1 text-accent"/>
                <span>{design.filterCategory}</span>
            </div>
        )}
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
