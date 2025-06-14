
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Lightbulb } from 'lucide-react';

export default function DesignGuidelinesPage() {
  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl font-headline text-primary">
            <ScrollText className="mr-3 h-8 w-8" />
            Design Guidelines
          </CardTitle>
          <CardDescription>Our principles and best practices for submitting designs to Reactiverse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-10 bg-muted/30 rounded-lg">
            <Lightbulb className="h-16 w-16 text-primary/70 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Guidelines Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We are currently drafting our comprehensive design guidelines to ensure quality and consistency. 
              Please check back soon for details on how to prepare your submissions.
            </p>
          </div>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold font-headline">Key Areas We'll Cover:</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Code Quality and Readability</li>
              <li>Component Reusability and Modularity</li>
              <li>Accessibility Standards (WCAG)</li>
              <li>Performance Considerations</li>
              <li>Design Aesthetics and User Experience</li>
              <li>Submission Formatting and Preview Requirements</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
