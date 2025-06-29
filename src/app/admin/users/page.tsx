
'use client';

import { useEffect, useState, useActionState, useCallback, startTransition, useRef, useMemo } from 'react';
import type { User, StoredUser, AdminSetUser2FAStatusFormState, AdminSetUserCanSetPriceFormState, AdminSetUserVerificationStatusFormState } from '@/lib/types';
import { getAllUsersAdminAction, deleteUserAdminAction, adminSetUser2FAStatusAction, adminSetUserCanSetPriceAction, adminSetUserVerificationStatusAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Users, Trash2, Eye, ShieldCheck, ShieldOff, Phone, Mail, UserSquare2, User as UserIconLucide, AlertTriangle, LockIcon, UnlockIcon, IndianRupee, XCircle, Github, Linkedin, EyeOff, Search, ListFilter } from 'lucide-react';
import SealCheckIcon from '@/components/icons/SealCheckIcon';
import FigmaIcon from '@/components/icons/FigmaIcon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const sanitizeUser = (user: StoredUser): User => {
  const { passwordHash, twoFactorPinHash, ...sanitized } = user;
  return {
    ...sanitized,
    failedPinAttempts: user.failedPinAttempts || 0,
    isLocked: user.isLocked || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
    canSetPrice: user.canSetPrice || false,
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    figmaUrl: user.figmaUrl || "",
    isEmailPublic: user.isEmailPublic === undefined ? false : user.isEmailPublic,
    isPhonePublic: user.isPhonePublic === undefined ? false : user.isPhonePublic,
    isVerified: user.isVerified === undefined ? false : user.isVerified,
  };
};

type UserSortOption = 
  | 'name-asc' | 'name-desc' 
  | 'username-asc' | 'username-desc'
  | 'email-asc' | 'email-desc'
  | 'status-verified' | 'status-unverified' 
  | 'status-2fa-enabled' | 'status-2fa-disabled'
  | 'status-locked' | 'status-active';

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
  const [current2FAAction, setCurrent2FAAction] = useState<'disable' | null>(null);

  const [userForPriceSetting, setUserForPriceSetting] = useState<User | null>(null);
  const [isPriceSettingDialogOpen, setIsPriceSettingDialogOpen] = useState(false);
  const [currentPriceSettingAction, setCurrentPriceSettingAction] = useState<'enable' | 'disable' | null>(null);

  const [userForVerification, setUserForVerification] = useState<User | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [currentVerificationAction, setCurrentVerificationAction] = useState<'verify' | 'unverify' | null>(null);

  const lastProcessed2FAMessageRef = useRef<string | null | undefined>(null);
  const lastProcessedPriceSettingMessageRef = useRef<string | null | undefined>(null);
  const lastProcessedVerificationMessageRef = useRef<string | null | undefined>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<UserSortOption>('name-asc');

  const initial2FAState: AdminSetUser2FAStatusFormState = { message: null, success: false, errors: {} };
  const [set2FAFormState, set2FAFormAction] = useActionState(adminSetUser2FAStatusAction, initial2FAState);

  const initialPriceSettingState: AdminSetUserCanSetPriceFormState = { message: null, success: false, errors: {} };
  const [setPriceSettingFormState, setPriceSettingFormAction] = useActionState(adminSetUserCanSetPriceAction, initialPriceSettingState);

  const initialVerificationState: AdminSetUserVerificationStatusFormState = { message: null, success: false, errors: {} };
  const [setVerificationFormState, setVerificationFormAction] = useActionState(adminSetUserVerificationStatusAction, initialVerificationState);

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

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(lowerSearchTerm) ||
            user.username.toLowerCase().includes(lowerSearchTerm) ||
            (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
        );
    }

    switch(sortBy) {
        case 'name-asc': filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': filtered.sort((a,b) => b.name.localeCompare(a.name)); break;
        case 'username-asc': filtered.sort((a,b) => a.username.localeCompare(b.username)); break;
        case 'username-desc': filtered.sort((a,b) => b.username.localeCompare(a.username)); break;
        case 'email-asc': filtered.sort((a,b) => (a.email || '').localeCompare(b.email || '')); break;
        case 'email-desc': filtered.sort((a,b) => (b.email || '').localeCompare(a.email || '')); break;
        case 'status-verified': filtered.sort((a,b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0)); break;
        case 'status-unverified': filtered.sort((a,b) => (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0)); break;
        case 'status-2fa-enabled': filtered.sort((a,b) => (b.twoFactorEnabled ? 1 : 0) - (a.twoFactorEnabled ? 1 : 0)); break;
        case 'status-2fa-disabled': filtered.sort((a,b) => (a.twoFactorEnabled ? 1 : 0) - (b.twoFactorEnabled ? 1 : 0)); break;
        case 'status-locked': filtered.sort((a,b) => (b.isLocked ? 1 : 0) - (a.isLocked ? 1 : 0)); break;
        case 'status-active': filtered.sort((a,b) => (a.isLocked ? 1 : 0) - (b.isLocked ? 1 : 0)); break;
    }
    return filtered;
  }, [users, searchTerm, sortBy]);


  const processFormStateUpdate = (
    formState: AdminSetUser2FAStatusFormState | AdminSetUserCanSetPriceFormState | AdminSetUserVerificationStatusFormState,
    closeDialogFn: () => void,
    lastProcessedMessageRef: React.MutableRefObject<string | null | undefined>
  ) => {
    if (formState?.message && formState.message !== lastProcessedMessageRef.current) {
      lastProcessedMessageRef.current = formState.message;
      toast({
        title: formState.success ? "Success" : "Error",
        description: formState.message,
        variant: formState.success ? "default" : "destructive",
      });
      if (formState.success) {
        closeDialogFn();
        fetchUsers();
        if (selectedUserForView && formState.updatedUser && selectedUserForView.id === formState.updatedUser.id) {
          setSelectedUserForView(sanitizeUser(formState.updatedUser as StoredUser));
        }
      }
    }
  };

  useEffect(() => {
    processFormStateUpdate(set2FAFormState, () => {
        setIs2FADialogOpen(false);
        setUserFor2FAManagement(null);
    }, lastProcessed2FAMessageRef);
  }, [set2FAFormState, toast, fetchUsers, selectedUserForView]);

  useEffect(() => {
    processFormStateUpdate(setPriceSettingFormState, () => {
        setIsPriceSettingDialogOpen(false);
        setUserForPriceSetting(null);
    }, lastProcessedPriceSettingMessageRef);
  }, [setPriceSettingFormState, toast, fetchUsers, selectedUserForView]);

  useEffect(() => {
    processFormStateUpdate(setVerificationFormState, () => {
        setIsVerificationDialogOpen(false);
        setUserForVerification(null);
    }, lastProcessedVerificationMessageRef);
  }, [setVerificationFormState, toast, fetchUsers, selectedUserForView]);


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

  const handleManage2FAClick = (user: User, action: 'disable') => {
    setUserFor2FAManagement(user);
    setCurrent2FAAction(action);
    setIs2FADialogOpen(true);
  };

  const handleConfirm2FAAction = () => {
    if (userFor2FAManagement && current2FAAction === 'disable' && adminUser && 'id' in adminUser) {
      const formData = new FormData();
      formData.append('userId', userFor2FAManagement.id);
      formData.append('enable', 'false');
      formData.append('adminId', adminUser.id);
      startTransition(() => {
        set2FAFormAction(formData);
      });
    }
  };

  const handleManagePriceSettingClick = (user: User, action: 'enable' | 'disable') => {
    setUserForPriceSetting(user);
    setCurrentPriceSettingAction(action);
    setIsPriceSettingDialogOpen(true);
  };

  const handleConfirmPriceSettingAction = () => {
    if (userForPriceSetting && currentPriceSettingAction && adminUser && 'id' in adminUser) {
      const formData = new FormData();
      formData.append('userId', userForPriceSetting.id);
      formData.append('canSetPrice', currentPriceSettingAction === 'enable' ? 'true' : 'false');
      formData.append('adminId', adminUser.id);
      startTransition(() => {
        setPriceSettingFormAction(formData);
      });
    }
  };

  const handleManageVerificationClick = (user: User, action: 'verify' | 'unverify') => {
    setUserForVerification(user);
    setCurrentVerificationAction(action);
    setIsVerificationDialogOpen(true);
  };

  const handleConfirmVerificationAction = () => {
    if (userForVerification && currentVerificationAction && adminUser && 'id' in adminUser) {
      const formData = new FormData();
      formData.append('userId', userForVerification.id);
      formData.append('isVerified', currentVerificationAction === 'verify' ? 'true' : 'false');
      formData.append('adminId', adminUser.id);
      startTransition(() => {
        setVerificationFormAction(formData);
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
        <CardDescription>View, manage user accounts, their 2FA status, pricing permissions, and verification status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name, username, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={sortBy} onValueChange={(value: UserSortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
                    <ListFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="username-asc">Username (A-Z)</SelectItem>
                    <SelectItem value="username-desc">Username (Z-A)</SelectItem>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                    <SelectItem value="status-verified">Verified First</SelectItem>
                    <SelectItem value="status-unverified">Unverified First</SelectItem>
                    <SelectItem value="status-2fa-enabled">2FA Enabled First</SelectItem>
                    <SelectItem value="status-2fa-disabled">2FA Disabled First</SelectItem>
                    <SelectItem value="status-locked">Locked First</SelectItem>
                    <SelectItem value="status-active">Active First</SelectItem>
                </SelectContent>
            </Select>
            {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm('')} className="w-full sm:w-auto">
                    <XCircle className="mr-2 h-4 w-4" /> Clear
                </Button>
            )}
        </div>

        {filteredAndSortedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Verified</TableHead>
                  <TableHead className="text-center">2FA</TableHead>
                  <TableHead className="text-center">Pricing</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
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
                    <TableCell className="text-center">
                      {user.isVerified ? (
                        <Badge variant="default" className="bg-transparent hover:bg-transparent border-none p-0">
                           <SealCheckIcon className="h-5 w-5 text-blue-500" />
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Not Verified
                        </Badge>
                      )}
                    </TableCell>
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
                      {user.canSetPrice ? (
                        <Badge variant="default" className="bg-sky-600 hover:bg-sky-700">
                          <IndianRupee className="mr-1 h-3.5 w-3.5" /> Allowed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Restricted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.isLocked ? (
                        <Badge variant="destructive">
                           <LockIcon className="mr-1 h-3.5 w-3.5" /> Locked ({user.failedPinAttempts || 0})
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
            <p className="text-muted-foreground text-center py-10">
                {searchTerm ? `No users match your search for "${searchTerm}".` : "No users found."}
            </p>
        )}
      </CardContent>

      {selectedUserForView && (
         <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserIconLucide className="mr-2 h-5 w-5 text-primary" />
                User Details: {selectedUserForView.name}
                {selectedUserForView.isVerified && (
                  <SealCheckIcon className="ml-2 h-5 w-5 text-blue-500" />
                )}
              </DialogTitle>
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
                <InfoItem icon={<UserIconLucide />} label="Username" value={selectedUserForView.username} />
                <InfoItem icon={<Mail />} label="Email" value={selectedUserForView.email || 'N/A'} />
                <InfoItem icon={<Phone />} label="Phone" value={selectedUserForView.phone || 'N/A'} />

                <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-semibold mb-2">Social Links:</h4>
                    <InfoItem icon={<Github />} label="GitHub" value={selectedUserForView.githubUrl || 'N/A'} isLink={!!selectedUserForView.githubUrl} />
                    <InfoItem icon={<Linkedin />} label="LinkedIn" value={selectedUserForView.linkedinUrl || 'N/A'} isLink={!!selectedUserForView.linkedinUrl} />
                    <InfoItem icon={<FigmaIcon />} label="Figma" value={selectedUserForView.figmaUrl || 'N/A'} isLink={!!selectedUserForView.figmaUrl} />
                </div>

                <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-semibold mb-2">Privacy & Status:</h4>
                    <InfoItem icon={selectedUserForView.isEmailPublic ? <Eye /> : <EyeOff />} label="Email Public" value={selectedUserForView.isEmailPublic ? "Yes" : "No"} />
                    <InfoItem icon={selectedUserForView.isPhonePublic ? <Eye /> : <EyeOff />} label="Phone Public" value={selectedUserForView.isPhonePublic ? "Yes" : "No"} />
                    <InfoItem
                        icon={selectedUserForView.isVerified ? <SealCheckIcon className="text-blue-500"/> : <XCircle className="text-muted-foreground"/>}
                        label="Verification Status"
                        value={selectedUserForView.isVerified ? "Verified" : "Not Verified"}
                    />
                    <InfoItem
                        icon={selectedUserForView.twoFactorEnabled ? <ShieldCheck className="text-green-500"/> : <ShieldOff />}
                        label="2FA Status"
                        value={selectedUserForView.twoFactorEnabled ? "Enabled" : "Disabled"}
                    />
                    <InfoItem
                        icon={selectedUserForView.canSetPrice ? <IndianRupee className="text-green-500"/> : <XCircle className="text-muted-foreground"/>}
                        label="Can Set Prices"
                        value={selectedUserForView.canSetPrice ? "Allowed" : "Restricted"}
                    />
                    <InfoItem
                        icon={selectedUserForView.isLocked ? <LockIcon className="text-destructive"/> : <UnlockIcon className="text-green-500"/>}
                        label="Account Status"
                        value={selectedUserForView.isLocked ? `Locked (Attempts: ${selectedUserForView.failedPinAttempts || 0})` : "Active"}
                    />
                </div>
                <div className="border-t pt-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold">Manage User Verification:</Label>
                        <Switch
                            checked={!!selectedUserForView.isVerified}
                            onCheckedChange={(checked) => handleManageVerificationClick(selectedUserForView, checked ? 'verify' : 'unverify')}
                            aria-label="Toggle user verification"
                        />
                    </div>
                    
                    <div>
                        <Label className="font-semibold">Manage User 2FA:</Label>
                        {selectedUserForView.twoFactorEnabled ? (
                            <Button 
                                variant="destructive" 
                                className="w-full mt-2" 
                                onClick={() => handleManage2FAClick(selectedUserForView, 'disable')}
                            >
                                <ShieldOff className="mr-2 h-4 w-4" /> Disable 2FA & Unlock Account
                            </Button>
                        ) : (
                            <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/30 mt-1">
                                2FA is currently disabled for this user. Users can enable 2FA from their own profile settings.
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="font-semibold">Manage Price Setting:</Label>
                        <Switch
                            checked={!!selectedUserForView.canSetPrice}
                            onCheckedChange={(checked) => handleManagePriceSettingClick(selectedUserForView, checked ? 'enable' : 'disable')}
                            aria-label="Toggle user ability to set prices"
                        />
                    </div>
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
                 Are you sure you want to <strong className="text-destructive">disable</strong> 2FA for this user?
                 This will also unlock their account if it was locked due to failed PIN attempts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setIs2FADialogOpen(false); setUserFor2FAManagement(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm2FAAction}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, disable 2FA & Unlock
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

       {isPriceSettingDialogOpen && userForPriceSetting && (
        <AlertDialog open={isPriceSettingDialogOpen} onOpenChange={setIsPriceSettingDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Price Setting Change for {userForPriceSetting.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to <strong className={currentPriceSettingAction === 'enable' ? 'text-green-600' : 'text-destructive'}>{currentPriceSettingAction}</strong> this user&apos;s ability to set prices for their designs?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setIsPriceSettingDialogOpen(false); setUserForPriceSetting(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmPriceSettingAction}
                className={currentPriceSettingAction === 'enable' ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90"}
              >
                Yes, {currentPriceSettingAction} permission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isVerificationDialogOpen && userForVerification && (
        <AlertDialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Verification Status Change for {userForVerification.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to <strong className={currentVerificationAction === 'verify' ? 'text-blue-600' : 'text-destructive'}>{currentVerificationAction}</strong> this user?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setIsVerificationDialogOpen(false); setUserForVerification(null);}}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmVerificationAction}
                className={currentVerificationAction === 'verify' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-destructive hover:bg-destructive/90"}
              >
                Yes, {currentVerificationAction} user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, isLink }) => (
    <div className="flex items-start">
        <span className="text-primary mr-3 mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0"> {}
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLink && value !== 'N/A' ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline break-all">
                    {value}
                </a>
            ) : (
                <p className="font-medium break-all">{value}</p>
            )}
        </div>
    </div>
);

    