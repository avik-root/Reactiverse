
'use client';

import type { Design } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Filter, Code2, Heart, BadgeCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LikeButton from './LikeButton';

interface DesignCardProps {
  design: Design;
  onOpenDetail: (design: Design) => void;
}

const DesignCard: React.FC<DesignCardProps> = ({ design, onOpenDetail }) => {
  const { user: currentUser } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = design.price && design.price > 0;
  const currentUserId = currentUser && 'id' in currentUser ? currentUser.id : undefined;
  const initialIsLiked = currentUserId ? design.likedBy.includes(currentUserId) : false;
  const initialLikeCount = design.likedBy.length;


  const previewSrcDoc = useMemo(() => {
    if (!design.codeBlocks || design.codeBlocks.length === 0) {
      return null;
    }
    const htmlBlock = design.codeBlocks.find(block => block.language.toLowerCase() === 'html');
    if (!htmlBlock) {
      return null;
    }
    const cssBlocks = design.codeBlocks.filter(block =>
      block.language.toLowerCase() === 'css' ||
      block.language.toLowerCase() === 'scss' ||
      block.language.toLowerCase() === 'tailwind css'
    );
    const htmlContent = htmlBlock.code;
    const cssContent = cssBlocks.map(block => block.code).join('\n');
    return `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              overflow: hidden;
              background-color: transparent;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
  }, [design.codeBlocks]);

  return (
    <Card
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out h-full flex flex-col rounded-lg"
    >
      <CardHeader
        className="p-0 relative bg-muted/30 flex items-center justify-center aspect-[16/9] min-h-[150px] overflow-hidden cursor-pointer"
        onClick={() => onOpenDetail(design)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(design)}}
        aria-label={`View details for ${design.title}`}
      >
        {previewSrcDoc ? (
          <div className="w-full h-full transform scale-[0.35] origin-center flex items-center justify-center pointer-events-none">
            <iframe
              srcDoc={previewSrcDoc}
              title={`${design.title} card preview`}
              sandbox="allow-same-origin"
              className="w-[calc(100%/0.35)] h-[calc(100%/0.35)] border-0 overflow-hidden bg-transparent"
              scrolling="no"
            />
          </div>
        ) : (
          <Code2 className="h-16 w-16 text-primary/70" />
        )}
        {isPriced ? (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs px-2 py-1 flex items-center z-10">
            <IndianRupee className="h-3 w-3 mr-1" />
            {design.price?.toFixed(2)}
          </Badge>
        ) : (
          <Badge variant="outline" className="absolute top-2 right-2 text-xs px-2 py-1 z-10 border-primary text-primary bg-background/70">
            Free
          </Badge>
        )}
      </CardHeader>
      <CardContent
        className="p-4 flex-grow cursor-pointer"
        onClick={() => onOpenDetail(design)}
        role="button"
        tabIndex={-1} // To avoid double tabbing with header
      >
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
      <CardFooter className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={design.designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(design.designer.name)}`} alt={design.designer.name} data-ai-hint="designer avatar" />
            <AvatarFallback>{getInitials(design.designer.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground flex items-center">
            {design.designer.name}
            {design.designer.isVerified && (
              <BadgeCheck className="ml-1 h-3.5 w-3.5 text-blue-500 fill-blue-500" />
            )}
          </span>
        </div>
        <LikeButton
            designId={design.id}
            initialLikeCount={initialLikeCount}
            initialIsLiked={initialIsLiked}
            currentUserId={currentUserId}
        />
      </CardFooter>
    </Card>
  );
};

export default DesignCard;
