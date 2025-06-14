'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeBlockProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
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
