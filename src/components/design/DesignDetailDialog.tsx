'use client';

import type { Design } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import CodeBlock from './CodeBlock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

interface DesignDetailDialogProps {
  design: Design | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DesignDetailDialog: React.FC<DesignDetailDialogProps> = ({ design, isOpen, onOpenChange }) => {
  if (!design) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'D'; // Default for Designer
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = design.price && design.price > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">{design.title}</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={design.designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(design.designer.name)}`} alt={design.designer.name} data-ai-hint="designer avatar" />
              <AvatarFallback>{getInitials(design.designer.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">By {design.designer.name}</span>
            {isPriced && (
              <Badge variant="secondary" className="ml-auto">
                <DollarSign className="h-4 w-4 mr-1 text-primary" />
                Price: ${design.price.toFixed(2)}
              </Badge>
            )}
          </div>
          <DialogDescription className="pt-1 text-left">
            {design.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="my-4 relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={design.imageUrl}
              alt={design.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="design preview"
            />
          </div>
          <div className="my-4">
            <h3 className="text-lg font-semibold font-headline mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {design.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          <CodeBlock code={design.code} isLocked={isPriced} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignDetailDialog;
