
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getNewsletterSubscribersAction } from '@/lib/actions';
import type { NewsletterSubscriber } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Users, CalendarDays, Search, ListFilter, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type SubscriberSortOption = 'email-asc' | 'email-desc' | 'newest' | 'oldest';

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SubscriberSortOption>('newest');

  useEffect(() => {
    async function fetchSubscribers() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSubscribers = await getNewsletterSubscribersAction();
        setSubscribers(fetchedSubscribers);
      } catch (e) {
        console.error("Failed to fetch newsletter subscribers:", e);
        setError("Could not load subscriber data. Please try again later.");
      }
      setIsLoading(false);
    }
    fetchSubscribers();
  }, []);

  const filteredAndSortedSubscribers = useMemo(() => {
    let filtered = [...subscribers];
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(subscriber =>
            subscriber.email.toLowerCase().includes(lowerSearchTerm)
        );
    }

    switch(sortBy) {
        case 'email-asc': filtered.sort((a,b) => a.email.localeCompare(b.email)); break;
        case 'email-desc': filtered.sort((a,b) => b.email.localeCompare(a.email)); break;
        case 'newest': filtered.sort((a,b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()); break;
        case 'oldest': filtered.sort((a,b) => new Date(a.subscribedAt).getTime() - new Date(b.subscribedAt).getTime()); break;
    }
    return filtered;
  }, [subscribers, searchTerm, sortBy]);


  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Users className="mr-3 h-8 w-8 animate-pulse" /> Newsletter Subscribers
          </CardTitle>
          <CardDescription>Loading subscriber data...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b">
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-4 w-1/5 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
             <Users className="mr-3 h-8 w-8" /> Newsletter Subscribers
          </CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline text-primary">Newsletter Subscribers</CardTitle>
        </div>
        <CardDescription>View users who have subscribed to newsletter updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={sortBy} onValueChange={(value: SubscriberSortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                    <ListFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                </SelectContent>
            </Select>
            {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm('')} className="w-full sm:w-auto">
                    <XCircle className="mr-2 h-4 w-4" /> Clear
                </Button>
            )}
        </div>

        {filteredAndSortedSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Subscribed At
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.email}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {format(new Date(subscriber.subscribedAt), "PPP p")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
             {searchTerm ? `No subscribers match your search for "${searchTerm}".` : "No newsletter subscribers yet."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

