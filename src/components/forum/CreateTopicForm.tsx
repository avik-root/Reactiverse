// src/components/forum/CreateTopicForm.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { createForumTopicAction, type CreateTopicFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Send, Loader2, FileText, MessageSquare, Info } from 'lucide-react';

interface CreateTopicFormProps {
  categoryId: string;
  categorySlug: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Create Topic
        </>
      )}
    </Button>
  );
}

export default function CreateTopicForm({
  categoryId,
  categorySlug,
  userId,
  userName,
  userAvatarUrl,
}: CreateTopicFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const initialState: CreateTopicFormState = { message: null, errors: {}, success: false, newTopicId: null };
  
  const createTopicActionWithParams = async (
    prevState: CreateTopicFormState,
    formData: FormData
  ): Promise<CreateTopicFormState> => {
    return createForumTopicAction(prevState, formData, categoryId, categorySlug, userId, userName, userAvatarUrl);
  };
  
  const [state, formAction] = useActionState(createTopicActionWithParams, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.newTopicId) {
        // For admin announcements, redirect to the admin announcements list
        if (categorySlug === 'announcements') {
            router.push(`/admin/forum/announcements`);
        } else { // For other categories, redirect to the public topic page
            router.push(`/community/topic/${state.newTopicId}?categorySlug=${categorySlug}`);
        }
      }
    }
  }, [state, toast, router, categorySlug]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">Topic Title</Label>
        <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            id="title"
            name="title"
            placeholder="Enter a clear and concise title for your topic"
            required
            minLength={5}
            maxLength={150}
            className="pl-10"
            aria-describedby="title-error"
            />
        </div>
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-destructive flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-base">Topic Content</Label>
         <div className="relative">
             <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
                id="content"
                name="content"
                placeholder="Share your thoughts, questions, or code snippets here..."
                required
                minLength={10}
                maxLength={5000}
                rows={10}
                className="pl-10"
                aria-describedby="content-error"
            />
        </div>
        {state?.errors?.content && (
          <p id="content-error" className="text-sm text-destructive flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.content.join(', ')}</p>
        )}
      </div>

      {state?.errors?.general && (
        <p className="text-sm text-destructive text-center flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.general.join(', ')}</p>
      )}

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
