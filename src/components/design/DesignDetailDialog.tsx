
'use client';

import type { Design, CodeBlockItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CodeBlock from './CodeBlock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Filter, Code2, Eye, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface DesignDetailDialogProps {
  design: Design | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DesignDetailDialog: React.FC<DesignDetailDialogProps> = ({ design, isOpen, onOpenChange }) => {
  if (!design) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = design.price && design.price > 0;

  const previewDoc = useMemo(() => {
    if (!design || !design.codeBlocks || design.codeBlocks.length === 0) {
      return '';
    }

    const htmlBlock = design.codeBlocks.find(block => block.language.toLowerCase() === 'html');
    const cssBlocks = design.codeBlocks.filter(block => block.language.toLowerCase() === 'css' || block.language.toLowerCase() === 'scss');
    const jsBlocks = design.codeBlocks.filter(block => block.language.toLowerCase() === 'javascript');
    // Basic check: if it's likely a framework component, don't attempt simple preview
    const isFramework = design.codeBlocks.some(block => ['react', 'vue', 'angular', 'tailwind css'].includes(block.language.toLowerCase()));


    if (isFramework && !htmlBlock) { // No simple HTML entry point for framework code
        return null; // Indicates framework and no simple HTML to render
    }
    
    // For non-framework or if HTML is present, try to build a simple preview
    const htmlContent = htmlBlock ? htmlBlock.code : '';
    const cssContent = cssBlocks.map(block => block.code).join('\n');
    const jsContent = jsBlocks.map(block => block.code).join('\n');

    if (!htmlContent && !cssContent && !jsContent) return ''; // Nothing to preview

    return `
      <html>
        <head>
          <style>
            body { margin: 0; padding: 10px; background-color: transparent; display: flex; justify-content: center; align-items: center; min-height: 90%; }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `;
  }, [design]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-headline text-2xl text-primary">{design.title}</DialogTitle>
          {design.filterCategory && (
            <div className="flex items-center text-sm text-muted-foreground pt-1">
                <Filter className="h-4 w-4 mr-1.5 text-accent"/>
                <span className="font-medium">{design.filterCategory}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={design.designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(design.designer.name)}`} alt={design.designer.name} data-ai-hint="designer avatar"/>
              <AvatarFallback>{getInitials(design.designer.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">By {design.designer.name}</span>
            {isPriced ? (
                <Badge variant="secondary" className="ml-auto">
                  <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                  Price: ₹{design.price.toFixed(2)}
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto text-primary border-primary">
                  Free
                </Badge>
              )
            }
          </div>
          <DialogDescription className="pt-1 text-left">
            {design.description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
            <h3 className="text-sm font-semibold mb-1">Tags:</h3>
            <div className="flex flex-wrap gap-1">
              {design.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-t pt-4 mt-2">
          {design.codeBlocks && design.codeBlocks.length > 0 ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-auto mb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Preview
                </TabsTrigger>
                {design.codeBlocks.map((block, index) => (
                  <TabsTrigger key={block.id || `code-${index}`} value={block.id || `code-${index}`}  className="flex items-center gap-2">
                     <Code2 className="h-4 w-4" /> {block.language}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="preview" className="h-[400px] rounded-md border bg-muted/20 relative">
                {isPriced ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-md">
                    <Lock className="h-16 w-16 text-primary mb-4" />
                    <p className="text-xl font-semibold text-foreground">Content Locked</p>
                    <p className="text-muted-foreground">This is a premium design. Preview is not available for free.</p>
                  </div>
                ) : previewDoc === null ? (
                     <Alert variant="default" className="m-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Preview Note</AlertTitle>
                        <AlertDescription>
                          A live preview for this component type (e.g., React, Vue, Tailwind CSS) is not available. 
                          Please refer to the code snippets and description.
                        </AlertDescription>
                    </Alert>
                ) : previewDoc === '' ? (
                    <Alert variant="default" className="m-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Preview Available</AlertTitle>
                        <AlertDescription>
                          There is no content available to preview for this design.
                        </AlertDescription>
                    </Alert>
                ) : (
                  <iframe
                    srcDoc={previewDoc}
                    title={`${design.title} Preview`}
                    sandbox="allow-scripts allow-same-origin" // Basic sandboxing
                    className="w-full h-full border-0 rounded-md"
                    // Consider adding loading state or error handling for iframe
                  />
                )}
              </TabsContent>

              {design.codeBlocks.map((block, index) => (
                <TabsContent key={block.id || `content-${index}`} value={block.id || `code-${index}`}>
                  <CodeBlock
                    codeSnippet={block.code}
                    language={block.language}
                    isLocked={isPriced}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="text-muted-foreground text-center py-10">No code snippets available for this design.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Simple Lock component for locked preview (can be enhanced)
const Lock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);


export default DesignDetailDialog;

    

    