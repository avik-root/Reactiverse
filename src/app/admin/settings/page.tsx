
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Construction } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline text-primary">Site Settings</CardTitle>
        </div>
        <CardDescription>Configure global application settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-16 bg-muted/30 rounded-lg">
          <Construction className="h-20 w-20 text-primary/60 mb-6" />
          <h3 className="text-2xl font-semibold mb-3">Under Construction</h3>
          <p className="text-muted-foreground max-w-md">
            The site settings area is currently under development. Advanced configuration options will be available here soon.
          </p>
          <p className="text-sm text-accent mt-4">Stay tuned for updates!</p>
        </div>
      </CardContent>
    </Card>
  );
}
