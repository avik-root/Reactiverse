
'use client';

import { useState } from "react";
import { Lock, Code2, Copy as CopyIcon, Check as CheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { incrementDesignCopyCountAction } from '@/lib/actions'; // Import the new action

interface CodeBlockProps {
  codeSnippet: string;
  language: string;
  isLocked?: boolean;
  designId?: string; // Add designId to identify which design's count to increment
}

const CodeBlock: React.FC<CodeBlockProps> = ({ codeSnippet, language, isLocked = false, designId }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (isLocked) {
        toast({ title: "Content Locked", description: "This is a premium design. The code is not available for free.", variant: "destructive" });
        return;
    }
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setIsCopied(true);
      toast({ title: "Copied!", description: `${language} code snippet copied to clipboard.` });
      setTimeout(() => setIsCopied(false), 2000);

      if (designId) {
        // Call the server action to increment copy count, no need to await or handle result here for UI responsiveness
        incrementDesignCopyCountAction(designId)
          .then(result => {
            if (result.success) {
              // console.log(`Copy count for design ${designId} incremented to ${result.newCount}`);
            } else {
              // console.warn(`Failed to increment copy count for design ${designId}: ${result.message}`);
            }
          })
          .catch(error => {
            // console.error(`Error incrementing copy count for design ${designId}:`, error);
          });
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({ title: "Error", description: "Failed to copy code.", variant: "destructive" });
    }
  };

  if (isLocked) {
    return (
      <Card className="code-block my-4 border-dashed border-primary/50 bg-muted/30 filter blur-sm select-none" data-locked="true">
        <CardHeader className="flex flex-row items-center justify-center space-x-3 p-6 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Content Locked</CardTitle>
            <CardDescription className="text-muted-foreground">This is a premium design. The code is not available for free.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="code-block my-4 space-y-2 relative group">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground mb-1">
        <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary"/>
            <span className="font-semibold text-primary">{language}</span> Code Snippet:
        </div>
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 m-1 px-2 py-1 h-auto"
            aria-label={isCopied ? "Copied" : `Copy ${language} code`}
        >
            {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
            <span className="ml-1 text-xs">{isCopied ? "Copied!" : "Copy"}</span>
        </Button>
       </div>
      <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto font-code text-sm">
        <code>{codeSnippet}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
