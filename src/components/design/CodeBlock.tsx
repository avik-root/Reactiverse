
'use client';

import { Lock, Code2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeBlockProps {
  codeSnippet: string;
  language: string;
  isLocked?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ codeSnippet, language, isLocked = false }) => {
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
    <div className="code-block my-4 space-y-2">
       <div className="flex items-center gap-2 text-sm text-muted-foreground">
         <Code2 className="h-5 w-5 text-primary"/>
         <span className="font-semibold text-primary">{language}</span> Code Snippet:
       </div>
      <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto font-code text-sm">
        <code>{codeSnippet}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
