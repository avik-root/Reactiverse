
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ForumTopic, AdminDeleteTopicResult } from '@/lib/types';
import { getTopicsByCategoryIdAction, getCategoryBySlugAction, adminDeleteTopicAction } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Trash2, Eye, CalendarDays, User as UserIcon, MessageCircle as ReplyIcon, Search, ListFilter, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_SLUG = 'support-qa';

type TopicSortOption = 'title-asc' | 'title-desc' | 'author-asc' | 'author-desc' | 'newest' | 'oldest' | 'replies-desc' | 'replies-asc';

export default function AdminManageSupportQAPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<TopicSortOption>('newest');

  const fetchTopics = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const category = await getCategoryBySlugAction(CATEGORY_SLUG);
      if (category) {
        const fetchedTopics = await getTopicsByCategoryIdAction(category.id);
        setTopics(fetchedTopics);
      } else {
        toast({ title: "Error", description: "Could not load category details.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      toast({ title: "Error", description: "Could not load topics.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [isAdmin, toast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics];
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(topic =>
            topic.title.toLowerCase().includes(lowerSearchTerm) ||
            topic.authorName.toLowerCase().includes(lowerSearchTerm) ||
            topic.content.toLowerCase().includes(lowerSearchTerm)
        );
    }
    switch(sortBy) {
        case 'title-asc': filtered.sort((a,b) => a.title.localeCompare(b.title)); break;
        case 'title-desc': filtered.sort((a,b) => b.title.localeCompare(a.title)); break;
        case 'author-asc': filtered.sort((a,b) => a.authorName.localeCompare(b.authorName)); break;
        case 'author-desc': filtered.sort((a,b) => b.authorName.localeCompare(a.authorName)); break;
        case 'newest': filtered.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
        case 'oldest': filtered.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
        case 'replies-desc': filtered.sort((a,b) => (b.replyCount || 0) - (a.replyCount || 0)); break;
        case 'replies-asc': filtered.sort((a,b) => (a.replyCount || 0) - (b.replyCount || 0)); break;
    }
    return filtered;
  }, [topics, searchTerm, sortBy]);

  const handleDeleteClick = (topic: ForumTopic) => {
    setTopicToDelete(topic);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (topicToDelete) {
      const result: AdminDeleteTopicResult = await adminDeleteTopicAction(topicToDelete.id, CATEGORY_SLUG);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        setTopics(prev => prev.filter(t => t.id !== topicToDelete.id));
      }
      setIsDeleteAlertOpen(false);
      setTopicToDelete(null);
    }
  };
  
  const handleCloseDeleteAlert = () => {
    setIsDeleteAlertOpen(false);
    setTopicToDelete(null);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary"><HelpCircle className="mr-3 h-8 w-8 animate-pulse" /> Manage Support & Q/A</CardTitle>
          <CardDescription>Loading topic data...</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(4)].map((_, i) => (
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
            <HelpCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">Manage Support & Q/A</CardTitle>
        </div>
        <CardDescription>Review and manage topics and posts within the Support & Q/A forum category.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={sortBy} onValueChange={(value: TopicSortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                    <ListFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="author-asc">Author (A-Z)</SelectItem>
                    <SelectItem value="author-desc">Author (Z-A)</SelectItem>
                    <SelectItem value="replies-desc">Replies (Most)</SelectItem>
                    <SelectItem value="replies-asc">Replies (Least)</SelectItem>
                </SelectContent>
            </Select>
            {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm('')} className="w-full sm:w-auto">
                    <XCircle className="mr-2 h-4 w-4" /> Clear
                </Button>
            )}
        </div>

        {filteredAndSortedTopics.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created At</TableHead>
                   <TableHead className="text-center">Replies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={topic.title}>{topic.title}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {topic.authorName}
                        </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                            <CalendarDays className="h-3.5 w-3.5 text-accent"/>
                            <span>{format(new Date(topic.createdAt), "MMM d, yyyy")}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs">
                            <ReplyIcon className="h-3.5 w-3.5 text-muted-foreground"/>
                            <span>{topic.replyCount}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/community/topic/${topic.id}?categorySlug=${CATEGORY_SLUG}`} target="_blank">
                            <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(topic)}>
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
            {searchTerm ? `No topics match your search for "${searchTerm}".` : "No topics found in Support & Q/A."}
          </p>
        )}
      </CardContent>

      {topicToDelete && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDeleteAlert(); else setIsDeleteAlertOpen(true);}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Topic Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the topic &quot;{topicToDelete.title}&quot; and all its posts?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteAlert}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, delete topic
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}

    