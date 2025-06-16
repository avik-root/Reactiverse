
// src/components/admin/forum/EditAnnouncementForm.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateAdminAnnouncementAction, type UpdateAdminAnnouncementFormState } from '@/lib/actions';
import type { ForumTopic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Save, Loader2, FileText, MessageSquare, Info } from 'lucide-react';

interface EditAnnouncementFormProps {
  topic: ForumTopic;
  adminId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </>
      )}
    </Button>
  );
}

export default function EditAnnouncementForm({ topic, adminId }: EditAnnouncementFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(topic.title);
  const [content, setContent] = useState(topic.content);

  const initialState: UpdateAdminAnnouncementFormState = { message: null, errors: {}, success: false };
  
  const updateActionWithParams = async (
    prevState: UpdateAdminAnnouncementFormState,
    formData: FormData
  ): Promise<UpdateAdminAnnouncementFormState> => {
    formData.set('topicId', topic.id); // Ensure topicId is part of formData
    formData.set('adminId', adminId); // Ensure adminId is part of formData
    return updateAdminAnnouncementAction(prevState, formData);
  };
  
  const [state, formAction] = useActionState(updateActionWithParams, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        router.push(`/admin/forum/announcements`);
      }
    }
  }, [state, toast, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="topicId" value={topic.id} />
      <input type="hidden" name="adminId" value={adminId} />
      
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">Announcement Title</Label>
        <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="title"
              name="title"
              placeholder="Enter a clear and concise title"
              required
              minLength={5}
              maxLength={150}
              className="pl-10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-describedby="title-error"
            />
        </div>
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-destructive flex items-center gap-1"><Info className="h-3 w-3"/> {state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-base">Announcement Content</Label>
         <div className="relative">
             <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
                id="content"
                name="content"
                placeholder="Write the announcement details here..."
                required
                minLength={10}
                maxLength={5000}
                rows={10}
                className="pl-10"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
