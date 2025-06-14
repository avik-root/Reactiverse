
'use client';

import { useEffect, useState } from 'react';
import type { User, StoredUser } from '@/lib/types'; // Using StoredUser for raw data, User for sanitized
import { getAllUsersAdminAction, deleteUserAdminAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Users, Trash2, Eye, ShieldCheck, ShieldOff, Phone, Mail, UserSquare2, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Sanitize user data for display (remove sensitive fields)
const sanitizeUser = (user: StoredUser): User => {
  const { passwordHash, twoFactorPinHash, ...sanitized } = user;
  return sanitized;
};

export default function ManageUsersPage() {
  const { user: adminUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;
      setIsLoading(true);
      try {
        const fetchedUsers = await getAllUsersAdminAction();
        setUsers(fetchedUsers.map(sanitizeUser)); // Sanitize before setting state
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchUsers();
  }, [isAdmin, toast]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteClick = (user: User) => {
    // Prevent admin from deleting themselves
    if (adminUser && 'id' in adminUser && adminUser.id === user.id) {
        toast({ title: "Action Not Allowed", description: "Administrators cannot delete their own account.", variant: "destructive"});
        return;
    }
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      const result = await deleteUserAdminAction(userToDelete.id);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      }
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Users className="mr-3 h-8 w-8 animate-pulse" /> Manage Users</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
              <Skeleton className="h-8 w-20 ml-auto rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Manage Users</CardTitle>
        </div>
        <CardDescription>View, manage, and delete user accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">2FA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell className="text-center">
                      {user.twoFactorEnabled ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <ShieldOff className="mr-1 h-3.5 w-3.5" /> Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUserForView(user)}>
                            <Eye className="mr-1 h-3.5 w-3.5" /> View
                          </Button>
                        </DialogTrigger>
                        {selectedUserForView && selectedUserForView.id === user.id && (
                           <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center"><UserIcon className="mr-2 h-5 w-5 text-primary" />User Details: {selectedUserForView.name}</DialogTitle>
                              <DialogDescription>Full information for {selectedUserForView.username}.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-24 w-24 border-2 border-primary">
                                        <AvatarImage src={selectedUserForView.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(selectedUserForView.name)}`} alt={selectedUserForView.name} data-ai-hint="user detail avatar"/>
                                        <AvatarFallback className="text-3xl">{getInitials(selectedUserForView.name)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <InfoItem icon={<UserSquare2 />} label="Full Name" value={selectedUserForView.name} />
                                <InfoItem icon={<UserIcon />} label="Username" value={selectedUserForView.username} />
                                <InfoItem icon={<Mail />} label="Email" value={selectedUserForView.email || 'N/A'} />
                                <InfoItem icon={<Phone />} label="Phone" value={selectedUserForView.phone || 'N/A'} />
                                <InfoItem 
                                    icon={selectedUserForView.twoFactorEnabled ? <ShieldCheck className="text-green-500"/> : <ShieldOff />} 
                                    label="2FA Status" 
                                    value={selectedUserForView.twoFactorEnabled ? "Enabled" : "Disabled"} 
                                />
                                <p className="text-xs text-muted-foreground pt-2">User ID: {selectedUserForView.id}</p>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(user)} disabled={adminUser && 'id' in adminUser && adminUser.id === user.id}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No users found.</p>
        )}
      </CardContent>

      {userToDelete && (
         <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm User Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user &quot;{userToDelete.name} ({userToDelete.username})&quot;?
                This action cannot be undone and will permanently remove their account and any associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                Yes, delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}

interface InfoItemProps { icon: React.ReactNode; label: string; value: string; }
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value}) => (
    <div className="flex items-start">
        <span className="text-primary mr-3 mt-0.5">{icon}</span>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);
