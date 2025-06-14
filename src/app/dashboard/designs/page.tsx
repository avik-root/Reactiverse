'use client';

import { useEffect, useState } from 'react';
import type { Design } from '@/lib/types';
import DesignCard from '@/components/design/DesignCard';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { getAllDesignsAction } from '@/lib/actions'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function MyDesignsPage() {
  const { user } = useAuth();
  const [userDesigns, setUserDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserDesigns() {
      if (!user || !('id' in user)) { // Ensure user object has id, typical for regular User
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const allDesigns = await getAllDesignsAction();
        // Filter designs submitted by the current user
        const filteredDesigns = allDesigns.filter(design => design.submittedByUserId === user.id);
        setUserDesigns(filteredDesigns);
      } catch (error) {
        console.error("Failed to fetch user designs:", error);
      }
      setIsLoading(false);
    }
    fetchUserDesigns();
  }, [user]);

  const handleOpenDetail = (design: Design) => {
    setSelectedDesign(design);
    setIsDialogOpen(true);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-3xl font-headline text-primary">My Designs</CardTitle>
          <CardDescription>Here are all the designs you&apos;ve submitted.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/designs/submit">
            <PlusCircle className="mr-2 h-5 w-5" />
            Submit New Design
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : userDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDesigns.map((design) => (
              <DesignCard key={design.id} design={design} onOpenDetail={handleOpenDetail} />
            ))}
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Designs Yet!</AlertTitle>
            <AlertDescription>
              You haven&apos;t submitted any designs. 
              <Button variant="link" asChild className="p-0 h-auto ml-1 text-accent">
                <Link href="/dashboard/designs/submit">Click here to add your first design!</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {selectedDesign && (
        <DesignDetailDialog
          design={selectedDesign}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </Card>
  );
}
