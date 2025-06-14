
'use client';

import { useEffect, useState } from 'react';
import type { Design, DeleteDesignResult } from '@/lib/types';
import DesignCard from '@/components/design/DesignCard';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { getAllDesignsAction, deleteDesignAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Info, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


export default function MyDesignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userDesigns, setUserDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    async function fetchUserDesigns() {
      if (!user || !('id' in user)) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const allDesigns = await getAllDesignsAction();
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
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClick = (design: Design) => {
    setDesignToDelete(design);
    setDeleteConfirmationText(''); // Reset confirmation text
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (designToDelete && deleteConfirmationText.toLowerCase() === 'delete') {
      const result: DeleteDesignResult = await deleteDesignAction(designToDelete.id);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        setUserDesigns(prev => prev.filter(d => d.id !== designToDelete.id));
      }
      setIsDeleteAlertOpen(false);
      setDesignToDelete(null);
      setDeleteConfirmationText('');
    } else if (deleteConfirmationText.toLowerCase() !== 'delete') {
        toast({
            title: "Confirmation Error",
            description: "Please type 'delete' to confirm.",
            variant: "destructive",
        });
    }
  };

  const handleCloseDeleteAlert = () => {
    setIsDeleteAlertOpen(false);
    setDesignToDelete(null);
    setDeleteConfirmationText('');
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
              <div key={i} className="space-y-2 p-4 border rounded-lg bg-card">
                 <div className="bg-muted/30 flex items-center justify-center aspect-[16/9] min-h-[150px] rounded-t-lg">
                    <Skeleton className="h-16 w-16 text-primary/70" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-8 w-1/2 rounded-md" />
                  <Skeleton className="h-8 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : userDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDesigns.map((design) => (
              <div key={design.id} className="flex flex-col">
                <DesignCard design={design} onOpenDetail={handleOpenDetail} />
                <div className="mt-auto flex gap-2 p-2 bg-card border border-t-0 rounded-b-lg">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/designs/edit/${design.id}`}>
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(design)} className="flex-1">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
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
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}

      {designToDelete && (
         <AlertDialog open={isDeleteAlertOpen} onOpenChange={(isOpen) => {
             if (!isOpen) {
                handleCloseDeleteAlert();
             } else {
                setIsDeleteAlertOpen(true);
             }
         }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your design
                &quot;{designToDelete.title}&quot;. <br/>
                To confirm, please type <strong className="text-destructive">delete</strong> in the box below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 my-4">
              <Label htmlFor="deleteConfirmInput" className="sr-only">Confirm delete</Label>
              <Input
                id="deleteConfirmInput"
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                className="border-primary focus:ring-destructive"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteAlert}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
                className={deleteConfirmationText.toLowerCase() === 'delete' ? "bg-destructive hover:bg-destructive/90" : "bg-destructive/50 cursor-not-allowed"}
              >
                Yes, delete design
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
