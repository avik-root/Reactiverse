'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";

interface CodeBlockProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
  isLocked?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, isLocked = false }) => {
  if (isLocked) {
    return (
      <div className="code-block my-4 p-6 border rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center filter blur-sm select-none" data-locked="true">
        <Lock className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Content Locked</h3>
        <p className="text-muted-foreground">This is a premium design. The code is not available for free.</p>
      </div>
    );
  }

  return (
    <div className="code-block my-4">
      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <pre>
            <code>{code.html}</code>
          </pre>
        </TabsContent>
        <TabsContent value="css">
          <pre>
            <code>{code.css}</code>
          </pre>
        </TabsContent>
        <TabsContent value="js">
          <pre>
            <code>{code.js}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeBlock;
