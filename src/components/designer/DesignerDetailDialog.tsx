
'use client';

import type { User } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign, Github, Linkedin, Mail, Palette, Phone, User as UserIcon, Eye, EyeOff, Star } from 'lucide-react';
import SealCheckIcon from '@/components/icons/SealCheckIcon'; // Import the new icon
import FigmaIcon from '@/components/icons/FigmaIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface DesignerStats extends User {
  totalLikes: number;
  totalDesignsUploaded: number;
}

interface DesignerDetailDialogProps {
  user: DesignerStats;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; isLink?: boolean; onCopy?: () => void; privacy?: boolean; isPublic?: boolean }> = ({ icon, label, value, isLink, onCopy, privacy, isPublic }) => {
  let displayValue = String(value);
  if (privacy && !isPublic && displayValue !== 'N/A') {
    displayValue = "Private";
  }

  return (
    <div className="flex items-start py-1.5 border-b border-border/50 last:border-b-0">
        <span className="text-primary mr-3 mt-1 shrink-0">{icon}</span>
        <div className="min-w-0 flex-grow">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLink && displayValue !== 'N/A' && displayValue !== "Private" ? (
                <a href={displayValue} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline break-all">
                    {displayValue}
                </a>
            ) : (
                <p className="font-medium break-all">{displayValue}</p>
            )}
        </div>
        {onCopy && displayValue !== 'N/A' && displayValue !== "Private" && (
             <Button variant="ghost" size="sm" onClick={onCopy} className="ml-2 px-2 py-1 h-auto text-xs self-center">Copy</Button>
        )}
    </div>
  );
}


const DesignerDetailDialog: React.FC<DesignerDetailDialogProps> = ({ user, isOpen, onOpenChange }) => {
  const { toast } = useToast();

  if (!user) return null;

  const handleCopyContact = (contact: string, type: 'Email' | 'Phone') => {
    navigator.clipboard.writeText(contact)
      .then(() => {
        toast({ title: `${type} Copied!`, description: `${user.name}'s ${type.toLowerCase()} copied to clipboard.` });
      })
      .catch(err => {
        console.error(`Failed to copy ${type.toLowerCase()}: `, err);
        toast({ title: "Error", description: `Failed to copy ${type.toLowerCase()}.`, variant: "destructive" });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader className="text-center items-center pt-4">
          <Avatar className="w-28 h-28 mb-4 border-4 border-primary shadow-md">
            <AvatarImage src={user.avatarUrl || `https://placehold.co/128x128.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="designer detail avatar" />
            <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <DialogTitle className="text-3xl font-headline text-primary flex items-center">
            {user.name}
            {user.isVerified && <SealCheckIcon className="ml-2 h-6 w-6 text-blue-500" />}
          </DialogTitle>
          <DialogDescription className="text-accent font-medium flex items-center justify-center">
            <AtSign className="h-5 w-5 mr-1" />
            {user.username.startsWith('@') ? user.username.substring(1) : user.username}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 border-t mt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            <Link href={`/?designerId=${user.id}#all-designs-section`} passHref>
              <Badge variant="secondary" className="justify-center py-1.5 cursor-pointer hover:bg-muted w-full">
                  <Palette className="h-4 w-4 mr-1.5 text-primary"/> Designs Uploaded: {user.totalDesignsUploaded}
              </Badge>
            </Link>
            <Badge variant="secondary" className="justify-center py-1.5">
                 <Star className="h-4 w-4 mr-1.5 text-primary fill-primary"/> Total Likes: {user.totalLikes}
            </Badge>
          </div>

          {user.email && (
            <InfoItem
              icon={<Mail className={user.isEmailPublic ? "text-green-500" : "text-muted-foreground"}/>}
              label="Email"
              value={user.email}
              privacy={true}
              isPublic={user.isEmailPublic}
              onCopy={user.isEmailPublic ? () => handleCopyContact(user.email!, 'Email') : undefined}
            />
          )}
          {user.phone && (
             <InfoItem
              icon={<Phone className={user.isPhonePublic ? "text-green-500" : "text-muted-foreground"}/>}
              label="Phone"
              value={user.phone}
              privacy={true}
              isPublic={user.isPhonePublic}
              onCopy={user.isPhonePublic ? () => handleCopyContact(user.phone!, 'Phone') : undefined}
            />
          )}

          <div className="pt-3">
            <h4 className="text-sm font-semibold mb-1.5 text-primary">Social & Professional Links:</h4>
            {user.githubUrl ? (
              <InfoItem icon={<Github />} label="GitHub" value={user.githubUrl} isLink />
            ) : (
              <InfoItem icon={<Github />} label="GitHub" value="N/A" />
            )}
            {user.linkedinUrl ? (
              <InfoItem icon={<Linkedin />} label="LinkedIn" value={user.linkedinUrl} isLink />
            ) : (
              <InfoItem icon={<Linkedin />} label="LinkedIn" value="N/A" />
            )}
            {user.figmaUrl ? (
              <InfoItem icon={<FigmaIcon />} label="Figma" value={user.figmaUrl} isLink />
            ) : (
              <InfoItem icon={<FigmaIcon />} label="Figma" value="N/A" />
            )}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerDetailDialog;
