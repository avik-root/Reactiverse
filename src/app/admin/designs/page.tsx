
'use client';

import { useEffect, useState } from 'react';
import type { Design, DeleteDesignResult } from '@/lib/types';
import { getAllDesignsAction, deleteDesignAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Palette, Trash2, Eye, IndianRupee, Filter as FilterIcon, Tag, UserSquare2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageDesignsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesignForView, setSelectedDesignForView] = useState<Design | null>(null);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState(''); // For typed confirmation

  useEffect(() => {
    async function fetchDesigns() {
      if (!isAdmin) return;
      setIsLoading(true);
      try {
        const fetchedDesigns = await getAllDesignsAction();
        setDesigns(fetchedDesigns);
      } catch (error) {
        console.error("Failed to fetch designs:", error);
        toast({ title: "Error", description: "Could not load designs.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchDesigns();
  }, [isAdmin, toast]);

  const handleOpenDetail = (design: Design) => {
    setSelectedDesignForView(design);
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
        setDesigns(prev => prev.filter(d => d.id !== designToDelete.id));
      }
      setIsDeleteAlertOpen(false);
      setDesignToDelete(null);
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

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><Palette className="mr-3 h-8 w-8 animate-pulse" /> Manage Designs</CardTitle>
          <CardDescription>Loading design data...</CardDescription>
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
            <Palette className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">Manage Designs</CardTitle>
        </div>
        <CardDescription>View, manage, and delete submitted designs.</CardDescription>
      </CardHeader>
      <CardContent>
        {designs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designs.map((design) => (
                  <TableRow key={design.id}>
                    <TableCell className="font-medium">{design.title}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <UserSquare2 className="h-4 w-4 text-muted-foreground" />
                            {design.designer.name}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5">
                            <FilterIcon className="h-3.5 w-3.5 text-accent"/>
                            <span>{design.filterCategory}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      {design.price && design.price > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          <IndianRupee className="mr-1 h-3 w-3" /> {design.price.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-primary text-primary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {design.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                            <Tag className="mr-1 h-3 w-3" />{tag}
                          </Badge>
                        ))}
                        {design.tags.length > 3 && <Badge variant="outline" className="text-xs px-1.5 py-0.5">...</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetail(design)}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(design)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No designs found.</p>
        )}
      </CardContent>

      {selectedDesignForView && (
        <DesignDetailDialog
          design={selectedDesignForView}
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}

      {designToDelete && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDeleteAlert(); else setIsDeleteAlertOpen(true);}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Design Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the design &quot;{designToDelete.title}&quot;?
                This action cannot be undone. Type <strong className="text-destructive">delete</strong> below to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
             <div className="py-2">
                <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className="w-full p-2 border border-input rounded-md focus:ring-destructive focus:border-destructive"
                />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteAlert}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className={deleteConfirmationText.toLowerCase() === 'delete' ? "bg-destructive hover:bg-destructive/90" : "bg-destructive/50 cursor-not-allowed"}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
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
