
'use client';

import type { User } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign, Github, Linkedin, Mail, Palette, Phone, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import FigmaIcon from '@/components/icons/FigmaIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DesignerDetailDialogProps {
  user: User & { totalDesignsUploaded: number };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string; isLink?: boolean; onCopy?: () => void; privacy?: boolean; isPublic?: boolean }> = ({ icon, label, value, isLink, onCopy, privacy, isPublic }) => {
  if (privacy && !isPublic && value !== 'N/A') {
    value = "Private";
  }
  
  return (
    <div className="flex items-start py-1">
        <span className="text-primary mr-3 mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-grow">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLink && value !== 'N/A' && value !== "Private" ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline break-all">
                    {value}
                </a>
            ) : (
                <p className="font-medium break-all">{value}</p>
            )}
        </div>
        {onCopy && value !== 'N/A' && value !== "Private" && (
             <Button variant="ghost" size="sm" onClick={onCopy} className="ml-2 px-2 py-1 h-auto text-xs">Copy</Button>
        )}
    </div>
  );
}


const DesignerDetailDialog: React.FC<DesignerDetailDialogProps> = ({ user, totalDesignsUploaded, isOpen, onOpenChange }) => {
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
          <DialogTitle className="text-3xl font-headline text-primary">{user.name}</DialogTitle>
          <DialogDescription className="text-accent font-medium flex items-center justify-center">
            <AtSign className="h-5 w-5 mr-1" />
            {user.username.startsWith('@') ? user.username.substring(1) : user.username}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3 border-t mt-4">
          <InfoItem 
            icon={<Palette className="text-primary"/>} 
            label="Designs Uploaded" 
            value={totalDesignsUploaded.toString()} 
          />

          {user.email && (
            <InfoItem
              icon={<Mail className={user.isEmailPublic ? "text-green-500" : "text-muted-foreground"}/>}
              label="Email"
              value={user.isEmailPublic ? user.email : "Private"}
              privacy={true}
              isPublic={user.isEmailPublic}
              onCopy={user.isEmailPublic ? () => handleCopyContact(user.email!, 'Email') : undefined}
            />
          )}
          {user.phone && (
             <InfoItem
              icon={<Phone className={user.isPhonePublic ? "text-green-500" : "text-muted-foreground"}/>}
              label="Phone"
              value={user.isPhonePublic ? user.phone : "Private"}
              privacy={true}
              isPublic={user.isPhonePublic}
              onCopy={user.isPhonePublic ? () => handleCopyContact(user.phone!, 'Phone') : undefined}
            />
          )}
          
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-semibold mb-1 text-primary">Social & Professional Links:</h4>
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
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerDetailDialog;
