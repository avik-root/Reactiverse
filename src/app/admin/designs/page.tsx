
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Design, DeleteDesignResult } from '@/lib/types';
import { getAllDesignsAction, deleteDesignAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Palette, Trash2, Eye, IndianRupee, Filter as FilterIcon, Tag, UserSquare2, Search, ListFilter, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DesignSortOption = 
  | 'newest' | 'oldest' 
  | 'title-asc' | 'title-desc' 
  | 'designer-asc' | 'designer-desc'
  | 'price-asc' | 'price-desc'
  | 'category-asc' | 'category-desc';

export default function ManageDesignsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesignForView, setSelectedDesignForView] = useState<Design | null>(null);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<DesignSortOption>('newest');

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

  const filteredAndSortedDesigns = useMemo(() => {
    let filtered = [...designs];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(design =>
        design.title.toLowerCase().includes(lowerSearchTerm) ||
        design.designer.name.toLowerCase().includes(lowerSearchTerm) ||
        design.filterCategory.toLowerCase().includes(lowerSearchTerm) ||
        design.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'designer-asc':
        filtered.sort((a, b) => a.designer.name.localeCompare(b.designer.name));
        break;
      case 'designer-desc':
        filtered.sort((a, b) => b.designer.name.localeCompare(a.designer.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'category-asc':
        filtered.sort((a,b) => a.filterCategory.localeCompare(b.filterCategory));
        break;
      case 'category-desc':
        filtered.sort((a,b) => b.filterCategory.localeCompare(a.filterCategory));
        break;
    }
    return filtered;
  }, [designs, searchTerm, sortBy]);

  const handleOpenDetail = (design: Design) => {
    setSelectedDesignForView(design);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClick = (design: Design) => {
    setDesignToDelete(design);
    setDeleteConfirmationText('');
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, designer, category, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: DesignSortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="designer-asc">Designer (A-Z)</SelectItem>
              <SelectItem value="designer-desc">Designer (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="category-asc">Category (A-Z)</SelectItem>
              <SelectItem value="category-desc">Category (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm('')} className="w-full sm:w-auto">
              <XCircle className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {filteredAndSortedDesigns.length > 0 ? (
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
                {filteredAndSortedDesigns.map((design) => (
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
          <p className="text-muted-foreground text-center py-10">
            {searchTerm ? `No designs match your search for "${searchTerm}".` : "No designs found."}
          </p>
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

    