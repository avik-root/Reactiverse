
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award } from 'lucide-react';

export default function TopDesignersPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <Award className="mr-3 h-8 w-8" />
            Top Designers
          </CardTitle>
          <CardDescription>Meet the most influential and creative designers on Reactiverse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-10 bg-muted/30 rounded-lg">
            <Users className="h-16 w-16 text-primary/70 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We&apos;re currently curating our list of top designers. Check back soon to see who&apos;s leading the pack in creativity and innovation!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
