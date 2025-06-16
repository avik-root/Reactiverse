
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare, Construction } from 'lucide-react';

export default function AdminManageGeneralDiscussionPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessagesSquare className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">Manage General Discussion</CardTitle>
          </div>
          <CardDescription>
            Oversee and manage topics and posts within the General Discussion forum category.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Functionality to manage General Discussion topics and posts will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
