
// src/components/forum/CreatePostForm.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createForumPostAction, type CreatePostFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SendHorizonal, Loader2, MessageSquare, Info } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { ForumPost } from '@/lib/types';


interface CreatePostFormProps {
  topicId: string;
  categorySlug: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  onPostCreated: (newPost: ForumPost) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Reply...
        </>
      ) : (
        <>
          <SendHorizonal className="mr-2 h-4 w-4" /> Post Reply
        </>
      )}
    </Button>
  );
}

export default function CreatePostForm({
  topicId,
  categorySlug,
  userId,
  userName,
  userAvatarUrl,
  onPostCreated,
}: CreatePostFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: CreatePostFormState = { message: null, errors: {}, success: false, newPost: null };
  
  const createPostActionWithParams = async (
    prevState: CreatePostFormState,
    formData: FormData
  ): Promise<CreatePostFormState> => {
    return createForumPostAction(prevState, formData, topicId, categorySlug, userId, userName, userAvatarUrl);
  };
  
  const [state, formAction] = useActionState(createPostActionWithParams, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.newPost) {
        onPostCreated(state.newPost);
        formRef.current?.reset(); 
      }
    }
  }, [state, toast, onPostCreated]);

  return (
    <Card className="shadow-md bg-card/70">
      <form ref={formRef} action={formAction}>
        <CardContent className="pt-6 space-y-2">
          <Label htmlFor="content" className="sr-only">Your Reply</Label>
           <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your reply here..."
                  required
                  minLength={1}
                  maxLength={2000}
                  rows={5}
                  className="pl-10 bg-background"
                  aria-describedby="reply-content-error"
              />
          </div>
          {state?.errors?.content && (
            <p id="reply-content-error" className="text-sm text-destructive flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.content.join(', ')}</p>
          )}
          {state?.errors?.general && (
            <p className="text-sm text-destructive text-center flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.general.join(', ')}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
