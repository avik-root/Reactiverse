
'use client';

import type { Design } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CodeBlock from './CodeBlock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Filter, Code2, Eye, Info, ThumbsUp, Heart } from 'lucide-react';
import SealCheckIcon from '@/components/icons/SealCheckIcon'; // Import the SealCheckIcon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LikeButton from './LikeButton';
import { useAuth } from '@/contexts/AuthContext';

interface DesignDetailDialogProps {
  design: Design | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DesignDetailDialog: React.FC<DesignDetailDialogProps> = ({ design: initialDesignProp, isOpen, onOpenChange }) => {
  const { user: currentUser } = useAuth();
  // Use internal state for the design to manage likes locally while dialog is open
  const [internalDesign, setInternalDesign] = useState<Design | null>(initialDesignProp);

  // Ref to track if the dialog was previously open to handle re-initialization correctly
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen) {
      // If dialog is opening or if the initialDesignProp's ID has changed
      // (meaning a new design is being passed in), update internalDesign.
      if (!wasOpenRef.current || (initialDesignProp && initialDesignProp.id !== internalDesign?.id)) {
        setInternalDesign(initialDesignProp);
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialDesignProp, internalDesign?.id]);


  if (!internalDesign) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isPriced = internalDesign.price && internalDesign.price > 0;
  const currentUserId = currentUser && 'id' in currentUser ? currentUser.id : undefined;
  
  // Derive these from internalDesign, which is updated by handleLikeChange
  const initialIsLiked = currentUserId ? internalDesign.likedBy.includes(currentUserId) : false;
  const initialLikeCount = internalDesign.likedBy.length;

  const handleLikeChange = (newLikeCountFromServer: number, newIsLikedFromServer: boolean) => {
    setInternalDesign(prevDesign => {
      if (!prevDesign) return null;
      const updatedLikedBy = [...prevDesign.likedBy];

      if (newIsLikedFromServer) {
        if (currentUserId && !updatedLikedBy.includes(currentUserId)) {
          updatedLikedBy.push(currentUserId);
        }
      } else {
        if (currentUserId) {
          const index = updatedLikedBy.indexOf(currentUserId);
          if (index > -1) {
            updatedLikedBy.splice(index, 1);
          }
        }
      }
      // The newLikeCountFromServer can be used if we want to directly set it,
      // but relying on updatedLikedBy.length is also fine.
      return { ...prevDesign, likedBy: updatedLikedBy };
    });
  };


  const previewDoc = useMemo(() => {
    if (!internalDesign || !internalDesign.codeBlocks || internalDesign.codeBlocks.length === 0) {
      return '';
    }

    const htmlBlock = internalDesign.codeBlocks.find(block => block.language.toLowerCase() === 'html');
    const cssBlocks = internalDesign.codeBlocks.filter(block => block.language.toLowerCase() === 'css' || block.language.toLowerCase() === 'scss');
    const jsBlocks = internalDesign.codeBlocks.filter(block => block.language.toLowerCase() === 'javascript');
    const isFramework = internalDesign.codeBlocks.some(block => ['react', 'vue', 'angular', 'tailwind css'].includes(block.language.toLowerCase()));

    if (isFramework && !htmlBlock) {
        return null; 
    }

    const htmlContent = htmlBlock ? htmlBlock.code : '';
    const cssContent = cssBlocks.map(block => block.code).join('\n');
    const jsContent = jsBlocks.map(block => block.code).join('\n');

    if (!htmlContent && !cssContent && !jsContent) return ''; 

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
  }, [internalDesign]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-headline text-2xl text-primary">{internalDesign.title}</DialogTitle>
          {internalDesign.filterCategory && (
            <div className="flex items-center text-sm text-muted-foreground pt-1">
                <Filter className="h-4 w-4 mr-1.5 text-accent"/>
                <span className="font-medium">{internalDesign.filterCategory}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={internalDesign.designer.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(internalDesign.designer.name)}`} alt={internalDesign.designer.name} data-ai-hint="designer avatar"/>
              <AvatarFallback>{getInitials(internalDesign.designer.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground flex items-center">
              By {internalDesign.designer.name}
              {internalDesign.designer.isVerified && (
                <SealCheckIcon className="ml-1.5 h-4 w-4 text-blue-500" />
              )}
            </span>
            
            <div className="ml-auto flex items-center gap-4">
                <LikeButton
                    designId={internalDesign.id}
                    initialLikeCount={initialLikeCount}
                    initialIsLiked={initialIsLiked}
                    onLikeToggle={handleLikeChange} // This updates internalDesign
                />
                {isPriced ? (
                    <Badge variant="secondary">
                    <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                    Price: ₹{internalDesign.price?.toFixed(2)}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-primary border-primary">
                    Free
                    </Badge>
                )
                }
            </div>
          </div>
          <DialogDescription className="pt-1 text-left">
            {internalDesign.description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2">
            <h3 className="text-sm font-semibold mb-1">Tags:</h3>
            <div className="flex flex-wrap gap-1">
              {internalDesign.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-t pt-4 mt-2">
          {internalDesign.codeBlocks && internalDesign.codeBlocks.length > 0 ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-auto mb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Preview
                </TabsTrigger>
                {internalDesign.codeBlocks.map((block, index) => (
                  <TabsTrigger key={block.id || `code-${index}`} value={block.id || `code-${index}`}  className="flex items-center gap-2">
                     <Code2 className="h-4 w-4" /> {block.language}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="preview" className="h-[400px] rounded-md border bg-muted/20 relative">
                {previewDoc === null ? (
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
                    title={`${internalDesign.title} Preview`}
                    sandbox="allow-scripts allow-same-origin" 
                    className="w-full h-full border-0 rounded-md"
                  />
                )}
              </TabsContent>

              {internalDesign.codeBlocks.map((block, index) => (
                <TabsContent key={block.id || `content-${index}`} value={block.id || `code-${index}`}>
                  <CodeBlock
                    codeSnippet={block.code}
                    language={block.language}
                    isLocked={isPriced}
                    designId={internalDesign.id} 
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

export default DesignDetailDialog;

