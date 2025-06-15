
'use client';

import { useEffect, useState, useActionState, startTransition } from 'react';
import { getForumCategoriesAction, addForumCategoryAction, type AddForumCategoryFormState } from '@/lib/actions';
import type { ForumCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutList, MessagesSquare, Palette, Code2, Lightbulb, Megaphone, HelpCircle, AlertTriangle, Info, Users, PlusCircle, Loader2, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

const LucideIconsMap = {
  MessagesSquare,
  Palette,
  Code2,
  Lightbulb,
  Megaphone,
  HelpCircle,
  Users,
  Info,
  Filter, // Added Filter as it was in the previous iconName type
  LayoutList, // Added LayoutList
};

type IconName = keyof typeof LucideIconsMap;
const iconNamesArray = Object.keys(LucideIconsMap) as IconName[];


function AddCategorySubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Category</>}
    </Button>
  );
}

export default function ManageForumCategoriesPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const initialFormState: AddForumCategoryFormState = { message: null, errors: {}, success: false };
  const [addCategoryFormState, addCategoryFormAction] = useActionState(addForumCategoryAction, initialFormState);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCategories = await getForumCategoriesAction();
      setCategories(fetchedCategories);
    } catch (e) {
      console.error("Failed to fetch forum categories:", e);
      setError("Could not load forum category data. Please try again later.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (addCategoryFormState?.message) {
      toast({
        title: addCategoryFormState.success ? "Success!" : "Error",
        description: addCategoryFormState.message,
        variant: addCategoryFormState.success ? "default" : "destructive",
      });
      if (addCategoryFormState.success) {
        setIsAddDialogOpen(false);
        fetchCategories(); // Re-fetch categories to update the list
      }
    }
  }, [addCategoryFormState, toast]);

  const handleSuggestedSlug = (name: string, setSlug: (slug: string) => void) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
    setSlug(slug);
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <LayoutList className="mr-3 h-8 w-8 animate-pulse" /> Manage Forum Categories
          </CardTitle>
          <CardDescription>Loading category data...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
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
             <LayoutList className="mr-3 h-8 w-8" /> Manage Forum Categories
          </CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutList className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-headline text-primary">Manage Forum Categories</CardTitle>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                 <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> Add New Category</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Forum Category</DialogTitle>
                  <DialogDescription>
                    Create a new category for the community forum. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form
                    action={addCategoryFormAction}
                    className="space-y-4"
                    onSubmit={(e) => {
                      const formData = new FormData(e.currentTarget);
                      startTransition(() => addCategoryFormAction(formData));
                      if(!addCategoryFormState?.errors && addCategoryFormState?.success) {
                        e.currentTarget.reset();
                      }
                    }}
                >
                    <div className="space-y-1">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" required onChange={(e) => {
                            const slugInput = e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement | null;
                            if (slugInput) handleSuggestedSlug(e.target.value, (val) => slugInput.value = val);
                        }} />
                        {addCategoryFormState?.errors?.name && <p className="text-sm text-destructive">{addCategoryFormState.errors.name.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required />
                        {addCategoryFormState?.errors?.description && <p className="text-sm text-destructive">{addCategoryFormState.errors.description.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="slug">Slug (auto-generated, editable)</Label>
                        <Input id="slug" name="slug" required />
                        <p className="text-xs text-muted-foreground">Lowercase, hyphens for spaces, e.g., general-discussion</p>
                        {addCategoryFormState?.errors?.slug && <p className="text-sm text-destructive">{addCategoryFormState.errors.slug.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="iconName">Icon</Label>
                        <Select name="iconName" required>
                            <SelectTrigger id="iconName">
                                <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {iconNamesArray.map(icon => {
                                   const IconComp = LucideIconsMap[icon];
                                   return (
                                    <SelectItem key={icon} value={icon}>
                                        <div className="flex items-center gap-2">
                                            <IconComp className="h-4 w-4" />
                                            {icon}
                                        </div>
                                    </SelectItem>
                                   );
                                })}
                            </SelectContent>
                        </Select>
                        {addCategoryFormState?.errors?.iconName && <p className="text-sm text-destructive">{addCategoryFormState.errors.iconName.join(', ')}</p>}
                    </div>
                    {addCategoryFormState?.errors?.general && <p className="text-sm text-destructive">{addCategoryFormState.errors.general.join(', ')}</p>}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <AddCategorySubmitButton />
                    </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
        <CardDescription>View and manage categories for the community forum. Full editing capabilities coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const IconComponent = LucideIconsMap[category.iconName as IconName] || Info;
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted p-1 rounded-sm">/{category.slug}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
             <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-lg mb-2">No Forum Categories Found</p>
            <p className="text-sm">It looks like there are no categories defined in <code>forum_categories.json</code>.</p>
            <p className="text-sm">Click "Add New Category" to create the first one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

