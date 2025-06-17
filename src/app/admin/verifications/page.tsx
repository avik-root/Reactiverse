
'use client';

import { useEffect, useState, useMemo, useActionState, startTransition } from 'react';
import type { VerificationRequest, AdminApproveVerificationFormState, AdminRejectVerificationFormState } from '@/lib/types';
import { getVerificationRequestsAction, adminApproveVerificationAction, adminRejectVerificationAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { BadgeCheck, Search, ListFilter, XCircle, UserSquare2, AtSign, Mail, Phone, CalendarDays, CheckCircle2, XSquare, ShieldQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type VerificationSortOption =
  | 'date-newest' | 'date-oldest'
  | 'name-asc' | 'name-desc'
  | 'status-pending' | 'status-approved' | 'status-rejected';


export default function AdminVerificationsPage() {
  const { user: adminUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<VerificationSortOption>('date-newest');

  const [requestToProcess, setRequestToProcess] = useState<VerificationRequest | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const initialApproveState: AdminApproveVerificationFormState = { message: null, success: false, errors: {} };
  const [approveFormState, approveFormAction] = useActionState(adminApproveVerificationAction, initialApproveState);

  const initialRejectState: AdminRejectVerificationFormState = { message: null, success: false, errors: {} };
  const [rejectFormState, rejectFormAction] = useActionState(adminRejectVerificationAction, initialRejectState);


  const fetchRequests = async () => {
      if (!isAdmin) return;
      setIsLoading(true);
      try {
        const fetchedRequests = await getVerificationRequestsAction();
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Failed to fetch verification requests:", error);
        toast({ title: "Error", description: "Could not load verification requests.", variant: "destructive" });
      }
      setIsLoading(false);
    };

  useEffect(() => {
    fetchRequests();
  }, [isAdmin]);

  useEffect(() => {
    if (approveFormState?.message) {
      toast({
        title: approveFormState.success ? "Success" : "Error",
        description: approveFormState.message,
        variant: approveFormState.success ? "default" : "destructive",
      });
      if (approveFormState.success) {
        fetchRequests(); // Re-fetch to update the list
        setIsApproveDialogOpen(false);
        setRequestToProcess(null);
      }
    }
  }, [approveFormState, toast]);

  useEffect(() => {
    if (rejectFormState?.message) {
      toast({
        title: rejectFormState.success ? "Success" : "Error",
        description: rejectFormState.message,
        variant: rejectFormState.success ? "default" : "destructive",
      });
      if (rejectFormState.success) {
        fetchRequests(); // Re-fetch to update the list
        setIsRejectDialogOpen(false);
        setRequestToProcess(null);
      }
    }
  }, [rejectFormState, toast]);


  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...requests];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.submittedName.toLowerCase().includes(lowerSearchTerm) ||
        req.submittedUsername.toLowerCase().includes(lowerSearchTerm) ||
        req.submittedEmail.toLowerCase().includes(lowerSearchTerm) ||
        (req.userId && req.userId.toLowerCase().includes(lowerSearchTerm))
      );
    }

    switch (sortBy) {
      case 'date-newest':
        filtered.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        break;
      case 'date-oldest':
        filtered.sort((a, b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime());
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.submittedName.localeCompare(b.submittedName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.submittedName.localeCompare(a.submittedName));
        break;
      case 'status-pending':
        filtered.sort((a,b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        break;
      case 'status-approved':
        filtered.sort((a,b) => (a.status === 'approved' ? -1 : 1) - (b.status === 'approved' ? -1 : 1) || new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        break;
      case 'status-rejected':
        filtered.sort((a,b) => (a.status === 'rejected' ? -1 : 1) - (b.status === 'rejected' ? -1 : 1) || new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        break;
    }
    return filtered;
  }, [requests, searchTerm, sortBy]);

  const handleApproveClick = (request: VerificationRequest) => {
    setRequestToProcess(request);
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (request: VerificationRequest) => {
    setRequestToProcess(request);
    setIsRejectDialogOpen(true);
  };
  
  const confirmApprove = () => {
    if (!requestToProcess || !adminUser || !('id' in adminUser)) return;
    const formData = new FormData();
    formData.append('requestId', requestToProcess.id);
    formData.append('adminId', adminUser.id);
    startTransition(() => approveFormAction(formData));
  };

  const confirmReject = () => {
    if (!requestToProcess || !adminUser || !('id' in adminUser)) return;
    const formData = new FormData();
    formData.append('requestId', requestToProcess.id);
    formData.append('adminId', adminUser.id);
    startTransition(() => rejectFormAction(formData));
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><BadgeCheck className="mr-3 h-8 w-8 animate-pulse" /> User Verification Requests</CardTitle>
          <CardDescription>Loading verification requests...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b">
              <div className="space-y-1 flex-grow">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded" />
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
            <BadgeCheck className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">User Verification Requests</CardTitle>
        </div>
        <CardDescription>Review and manage user verification applications.</CardDescription>
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
          <Select value={sortBy} onValueChange={(value: VerificationSortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-newest">Newest First</SelectItem>
              <SelectItem value="date-oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="status-pending">Status: Pending First</SelectItem>
              <SelectItem value="status-approved">Status: Approved First</SelectItem>
              <SelectItem value="status-rejected">Status: Rejected First</SelectItem>
            </SelectContent>
          </Select>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm('')} className="w-full sm:w-auto">
              <XCircle className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {filteredAndSortedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                            <UserSquare2 className="h-4 w-4 text-muted-foreground" />
                           {req.submittedName}
                        </div>
                    </TableCell>
                    <TableCell>
                         <div className="flex items-center gap-1.5">
                            <AtSign className="h-4 w-4 text-muted-foreground" />
                           {req.submittedUsername}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                           {req.submittedEmail}
                        </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                           {req.submittedPhone}
                        </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(req.requestDate), "MMM d, yyyy")}
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === 'approved' ? 'default' :
                          req.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className={
                          req.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 
                          req.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-background' : ''
                        }
                      >
                        {req.status === 'pending' && <ShieldQuestion className="mr-1.5 h-3.5 w-3.5" />}
                        {req.status === 'approved' && <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                        {req.status === 'rejected' && <XSquare className="mr-1.5 h-3.5 w-3.5" />}
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApproveClick(req)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5"/> Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRejectClick(req)}>
                            <XSquare className="mr-1.5 h-3.5 w-3.5"/> Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            {searchTerm ? `No verification requests match your search for "${searchTerm}".` : "No pending verification requests."}
          </p>
        )}
      </CardContent>

      {requestToProcess && (
        <>
          <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Verification Request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to approve the verification request for <span className="font-semibold">{requestToProcess.submittedName}</span> ({requestToProcess.submittedUsername})?
                  This will mark the user as verified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setIsApproveDialogOpen(false); setRequestToProcess(null); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
                  Approve
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Verification Request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject the verification request for <span className="font-semibold">{requestToProcess.submittedName}</span> ({requestToProcess.submittedUsername})?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setIsRejectDialogOpen(false); setRequestToProcess(null); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmReject} className="bg-destructive hover:bg-destructive/90">
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  );
}

