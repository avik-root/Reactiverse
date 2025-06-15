
'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign } from 'lucide-react';

interface DesignerCardProps {
  user: User;
}

const getInitials = (name?: string) => {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const DesignerCard: React.FC<DesignerCardProps> = ({ user }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col items-center text-center p-6 bg-card">
      <Avatar className="w-24 h-24 mb-4 border-2 border-primary shadow-sm">
        <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="designer avatar" />
        <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <CardTitle className="text-2xl font-headline text-primary mb-1">{user.name}</CardTitle>
      <CardDescription className="text-accent font-medium flex items-center">
        <AtSign className="h-4 w-4 mr-1" />
        {user.username.startsWith('@') ? user.username.substring(1) : user.username}
      </CardDescription>
      {/* Future enhancements: Link to profile, number of designs, etc. */}
    </Card>
  );
};

export default DesignerCard;
