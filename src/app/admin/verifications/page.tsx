
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { VerificationRequest } from '@/lib/types';
import { getVerificationRequestsAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckBadge, Search, ListFilter, XCircle, UserSquare2, AtSign, Mail, Phone, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type VerificationSortOption = 
  | 'date-newest' | 'date-oldest' 
  | 'name-asc' | 'name-desc'
  | 'status-pending' | 'status-approved' | 'status-rejected';


export default function AdminVerificationsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<VerificationSortOption>('date-newest');

  useEffect(() => {
    async function fetchRequests() {
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
    }
    fetchRequests();
  }, [isAdmin, toast]);

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


  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><CheckBadge className="mr-3 h-8 w-8 animate-pulse" /> User Verification Requests</CardTitle>
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
            <CheckBadge className="h-8 w-8 text-primary" />
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
                          req.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''
                        }
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* TODO: Implement Approve/Reject actions */}
                      <Button variant="outline" size="sm" disabled>
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" disabled>
                        Reject
                      </Button>
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
    </Card>
  );
}
