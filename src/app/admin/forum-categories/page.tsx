
'use client';

import { useEffect, useState } from 'react';
import { getForumCategoriesAction } from '@/lib/actions';
import type { ForumCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutList, MessagesSquare, Palette, Code2, Lightbulb, Megaphone, HelpCircle, AlertTriangle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LucideIconsMap = {
  MessagesSquare,
  Palette,
  Code2,
  Lightbulb,
  Megaphone,
  HelpCircle,
};

type IconName = keyof typeof LucideIconsMap;

export default function ManageForumCategoriesPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
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
    }
    fetchCategories();
  }, []);

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
             <Button variant="outline" disabled>Add New Category (Soon)</Button>
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
            <p className="text-sm">Please add some categories to the file to see them listed here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
