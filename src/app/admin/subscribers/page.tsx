
'use client';

import { useEffect, useState } from 'react';
import { getNewsletterSubscribersAction } from '@/lib/actions';
import type { NewsletterSubscriber } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Users, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        {subscribers.length > 0 ? (
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
                {subscribers.map((subscriber) => (
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
          <p className="text-muted-foreground text-center py-10">No newsletter subscribers yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
