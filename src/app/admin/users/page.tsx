
'use client';

import { useEffect, useState, useActionState, useCallback, startTransition } from 'react';
import type { User, StoredUser, AdminSetUser2FAStatusFormState } from '@/lib/types';
import { getAllUsersAdminAction, deleteUserAdminAction, adminSetUser2FAStatusAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Users, Trash2, Eye, ShieldCheck, ShieldOff, Phone, Mail, UserSquare2, User as UserIcon, AlertTriangle, LockIcon, UnlockIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label'; // Added for 2FA management dialog

const sanitizeUser = (user: StoredUser): User => {
  const { passwordHash, twoFactorPinHash, ...sanitized } = user;
  return {
    ...sanitized,
    failedPinAttempts: user.failedPinAttempts || 0,
    isLocked: user.isLocked || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
  };
};

export default function ManageUsersPage() {
  const { user: adminUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userFor2FAManagement, setUserFor2FAManagement] = useState<User | null>(null);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [current2FAAction, setCurrent2FAAction] = useState<'enable' | 'disable' | null>(null);

  const initial2FAState: AdminSetUser2FAStatusFormState = { message: null, success: false, errors: {} };
  const [set2FAFormState, set2FAFormAction] = useActionState(adminSetUser2FAStatusAction, initial2FAState);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsersAdminAction();
      setUsers(fetchedUsers.map(sanitizeUser));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [isAdmin, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (set2FAFormState?.message) {
      toast({
        title: set2FAFormState.success ? "Success" : "Error",
        description: set2FAFormState.message,
        variant: set2FAFormState.success ? "default" : "destructive",
      });
      if (set2FAFormState.success) {
        setIs2FADialogOpen(false);
        setUserFor2FAManagement(null);
        fetchUsers(); // Re-fetch users to update the list
        if (selectedUserForView && set2FAFormState.updatedUser && selectedUserForView.id === set2FAFormState.updatedUser.id) {
          setSelectedUserForView(sanitizeUser(set2FAFormState.updatedUser as StoredUser));
        }
      }
    }
  }, [set2FAFormState, toast, fetchUsers, selectedUserForView]);


  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteClick = (user: User) => {
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

  const openDetailDialog = (user: User) => {
    setSelectedUserForView(user);
    setIsDetailDialogOpen(true);
  };

  const handleManage2FAClick = (user: User, action: 'enable' | 'disable') => {
    setUserFor2FAManagement(user);
    setCurrent2FAAction(action);
    setIs2FADialogOpen(true);
  };

  const handleConfirm2FAAction = () => {
    if (userFor2FAManagement && current2FAAction && adminUser && 'id' in adminUser) {
      const formData = new FormData();
      formData.append('userId', userFor2FAManagement.id);
      formData.append('enable', current2FAAction === 'enable' ? 'true' : 'false');
      formData.append('adminId', adminUser.id); // Pass adminId for verification
      startTransition(() => {
        set2FAFormAction(formData);
      });
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
        <CardDescription>View, manage user accounts, and their 2FA status.</CardDescription>
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
                  <TableHead className="text-center">Status</TableHead>
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
                    <TableCell className="text-center">
                      {user.isLocked ? (
                        <Badge variant="destructive">
                           <LockIcon className="mr-1 h-3.5 w-3.5" /> Locked
                        </Badge>
                      ) : (
                         <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                           <UnlockIcon className="mr-1 h-3.5 w-3.5" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openDetailDialog(user)}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
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

      {selectedUserForView && (
         <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
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
                <InfoItem
                    icon={selectedUserForView.isLocked ? <LockIcon className="text-destructive"/> : <UnlockIcon className="text-green-500"/>}
                    label="Account Status"
                    value={selectedUserForView.isLocked ? `Locked (Attempts: ${selectedUserForView.failedPinAttempts || 0})` : "Active"}
                />
                <p className="text-xs text-muted-foreground pt-2">User ID: {selectedUserForView.id}</p>

                <div className="border-t pt-4 mt-4 space-y-2">
                    <Label className="font-semibold">Manage 2FA for User:</Label>
                    {selectedUserForView.twoFactorEnabled ? (
                        <Button variant="outline" className="w-full" onClick={() => handleManage2FAClick(selectedUserForView, 'disable')}>
                            <ShieldOff className="mr-2 h-4 w-4" /> Disable User's 2FA
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => handleManage2FAClick(selectedUserForView, 'enable')}>
                            <ShieldCheck className="mr-2 h-4 w-4" /> Enable User's 2FA
                        </Button>
                    )}
                    {selectedUserForView.isLocked && (
                         <Button variant="outline" className="w-full" onClick={() => handleManage2FAClick(selectedUserForView, 'disable')}>
                            <UnlockIcon className="mr-2 h-4 w-4" /> Unlock Account & Disable 2FA
                        </Button>
                    )}
                </div>
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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

      {is2FADialogOpen && userFor2FAManagement && (
        <AlertDialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm 2FA Change for {userFor2FAManagement.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to <strong className={current2FAAction === 'enable' ? 'text-green-600' : 'text-destructive'}>{current2FAAction}</strong> 2FA for this user?
                {current2FAAction === 'disable' && ' This will also unlock their account if it was locked due to failed PIN attempts.'}
                {current2FAAction === 'enable' && ' The user will need to set up their PIN through their profile settings.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setIs2FADialogOpen(false); setUserFor2FAManagement(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm2FAAction}
                className={current2FAAction === 'enable' ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90"}
              >
                Yes, {current2FAAction} 2FA
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

