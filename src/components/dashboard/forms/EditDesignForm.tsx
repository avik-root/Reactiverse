
'use client';

import type { Design, CodeBlockItem as FormCodeBlockItem } from '@/lib/types';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateDesignAction, type UpdateDesignFormState } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Save, Tag, Code2, Filter, IndianRupee, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const LANGUAGES = [
  "HTML", "CSS", "Tailwind CSS", "SCSS", "JavaScript", 
  "Bootstrap", "Material UI", "Animations", "React", 
  "Vue.js", "Angular", "Other"
];

interface EditDesignFormProps {
  design: Design;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving Changes...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
    </Button>
  );
}

export default function EditDesignForm({ design }: EditDesignFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const initialState: UpdateDesignFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(updateDesignAction, initialState);

  const [title, setTitle] = useState(design.title);
  const [filterCategory, setFilterCategory] = useState(design.filterCategory);
  const [description, setDescription] = useState(design.description);
  const [tags, setTags] = useState(design.tags.join(', '));
  const [isPaid, setIsPaid] = useState<boolean>(!!design.price && design.price > 0);
  const [price, setPrice] = useState<string>(design.price ? design.price.toString() : "0");
  const [codeBlocks, setCodeBlocks] = useState<FormCodeBlockItem[]>(
    design.codeBlocks.map(cb => ({ ...cb, id: cb.id || `cb-${Date.now()}-${Math.random()}` })) || [{ id: `cb-${Date.now()}`, language: '', code: '' }]
  );


  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        router.push('/dashboard/designs');
      }
    }
  }, [state, toast, router]);

  if (!user || !('id' in user) || user.id !== design.submittedByUserId) {
    // This check is more of a safeguard, main auth check is on the page level
    return <p>You are not authorized to edit this design or user data is unavailable.</p>;
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
        setPrice(value);
    } else if (value === "" && !isPaid) {
        setPrice("0");
    }
  };
  
  const effectivePrice = isPaid ? (price === "" ? "0" : price) : "0";

  const addCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { id: `cb-${Date.now()}-${Math.random()}`, language: '', code: '' }]);
  };

  const removeCodeBlock = (id: string) => {
    if (codeBlocks.length > 1) {
      setCodeBlocks(codeBlocks.filter(block => block.id !== id));
    } else {
      toast({ title: "Cannot remove", description: "At least one code snippet is required.", variant: "destructive"});
    }
  };

  const handleCodeBlockChange = (id: string, field: 'language' | 'code', value: string) => {
    setCodeBlocks(
      codeBlocks.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  };
  
  // Prepare codeBlocks for submission, ensuring `id` is part of the JSON for potential re-use or tracking if needed
  const codeBlocksJSON = JSON.stringify(codeBlocks.map(cb => ({ id: cb.id, language: cb.language, code: cb.code })));

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <Edit className="mr-2 h-6 w-6" /> Edit Design: {design.title}
        </CardTitle>
        <CardDescription>Modify the details of your design submission.</CardDescription>
      </CardHeader>
      <form id="editDesignForm" action={dispatch}>
        <input type="hidden" name="designId" value={design.id} />
        <input type="hidden" name="submittedByUserId" value={user.id} />
        <input type="hidden" name="price" value={effectivePrice} />
        <input type="hidden" name="codeBlocksJSON" value={codeBlocksJSON} />

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Design Title</Label>
            <Input id="title" name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required aria-describedby="title-error"/>
            {state?.errors?.title && <p id="title-error" className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="filterCategory">Filter Category</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="filterCategory" name="filterCategory" type="text" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} required className="pl-10" aria-describedby="filterCategory-error"/>
            </div>
            {state?.errors?.filterCategory && <p id="filterCategory-error" className="text-sm text-destructive">{state.errors.filterCategory.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required  aria-describedby="description-error"/>
            {state?.errors?.description && <p id="description-error" className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
          </div>
          
          <div className="space-y-4">
            <Label className="text-base font-medium">Code Snippets</Label>
            {codeBlocks.map((block, index) => (
              <Card key={block.id} className="p-4 space-y-3 bg-muted/50">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`language-${block.id}`}>Language/Framework #{index + 1}</Label>
                  {codeBlocks.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCodeBlock(block.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>
                <Select
                  name={`language-${block.id}`} 
                  required
                  onValueChange={(value) => handleCodeBlockChange(block.id, 'language', value)}
                  value={block.language}
                >
                  <SelectTrigger id={`language-${block.id}`}>
                    <SelectValue placeholder="Select language/framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {state?.errors?.codeBlocks && state.errors.codeBlocks[index]?.language && <p className="text-sm text-destructive">{state.errors.codeBlocks[index].language.join(', ')}</p>}


                <Label htmlFor={`codeSnippet-${block.id}`}>Code Snippet #{index + 1}</Label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea 
                    id={`codeSnippet-${block.id}`}
                    name={`codeSnippet-${block.id}`} 
                    placeholder={`Paste your ${block.language || 'selected language'} code here...`} 
                    required 
                    rows={8} 
                    className="pl-10 font-mono text-sm"
                    value={block.code}
                    onChange={(e) => handleCodeBlockChange(block.id, 'code', e.target.value)}
                  />
                </div>
                {state?.errors?.codeBlocks && state.errors.codeBlocks[index]?.code && <p className="text-sm text-destructive">{state.errors.codeBlocks[index].code.join(', ')}</p>}
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addCodeBlock} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Snippet
            </Button>
            {state?.errors?.codeBlocksJSON && <p className="text-sm text-destructive">{state.errors.codeBlocksJSON.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="tags" name="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} required className="pl-10" aria-describedby="tags-error"/>
            </div>
            {state?.errors?.tags && <p id="tags-error" className="text-sm text-destructive">{state.errors.tags.join(', ')}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="isPaidSwitch" checked={isPaid} onCheckedChange={setIsPaid} />
              <Label htmlFor="isPaidSwitch" className="text-base">
                {isPaid ? "Paid Design (Set Price)" : "Free Design"}
              </Label>
            </div>

            {isPaid && (
              <div className="space-y-2">
                <Label htmlFor="priceInput">Price (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="priceInput" 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    value={price}
                    onChange={handlePriceChange}
                    required={isPaid}
                    className="pl-10" 
                    aria-describedby="price-error"
                  />
                </div>
                {state?.errors?.price && <p id="price-error" className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
              </div>
            )}
          </div>

          {state?.errors?.general && <p className="text-sm text-destructive">{state.errors.general.join(', ')}</p>}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <SubmitButton />
           <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

