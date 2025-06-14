
'use client';

import { useEffect, useState } from 'react';
import type { Design } from '@/lib/types';
import DesignCard from '@/components/design/DesignCard';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { getAllDesignsAction } from '@/lib/actions'; 
import { Skeleton } from '@/components/ui/skeleton';
import ScrambledText from '@/components/effects/ScrambledText'; 

export default function HomePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDesigns() {
      setIsLoading(true);
      try {
        const fetchedDesigns = await getAllDesignsAction();
        setDesigns(fetchedDesigns);
      } catch (error) {
        console.error("Failed to fetch designs:", error);
      }
      setIsLoading(false);
    }
    fetchDesigns();
  }, []);

  const handleOpenDetail = (design: Design) => {
    setSelectedDesign(design);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Welcome to Reactiverse
        </h1>
        <ScrambledText className="text-lg md:text-xl text-muted-foreground mx-auto whitespace-nowrap">
          Discover amazing components and designs shared by our talented community. Dive in and get inspired!
        </ScrambledText>
      </section>

      <section>
        <h2 className="text-3xl font-semibold font-headline mb-6 text-center">Featured Designs</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-lg bg-card">
                <Skeleton className="h-[100px] w-full rounded-lg bg-muted/50" /> 
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-8 w-1/3 rounded-md mt-2" />
              </div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} onOpenDetail={handleOpenDetail} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No designs available at the moment. Check back soon!</p>
        )}
      </section>

      {selectedDesign && (
        <DesignDetailDialog
          design={selectedDesign}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
