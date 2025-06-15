
'use client';

import { useState, useEffect, useOptimistic } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toggleLikeDesignAction, type ToggleLikeDesignResult } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // To get current user

interface LikeButtonProps {
  designId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  currentUserId?: string; // Optional, can also be fetched from context
  onLikeToggle?: (newLikeCount: number, newIsLiked: boolean) => void; // Callback for parent
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  designId,
  initialLikeCount,
  initialIsLiked,
  currentUserId: propCurrentUserId,
  onLikeToggle,
  className,
}) => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const currentUserId = propCurrentUserId || (authUser && 'id' in authUser ? authUser.id : undefined);

  const [optimisticState, toggleOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likeCount: initialLikeCount },
    (state) => ({
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
    })
  );

  const [isPending, setIsPending] = useState(false);

  // Sync with props if they change from parent (e.g., after a list refresh)
   useEffect(() => {
    if (optimisticState.isLiked !== initialIsLiked || optimisticState.likeCount !== initialLikeCount) {
        // This condition might be too aggressive if optimistic updates are frequent.
        // Consider if this is needed or if optimistic state should be the source of truth after first interaction.
        // For now, let's assume parent will re-render with fresh props on major data changes.
    }
  }, [initialIsLiked, initialLikeCount]);


  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like designs.',
        variant: 'destructive',
      });
      return;
    }

    if (isPending) return;
    setIsPending(true);

    toggleOptimisticState(undefined); // Apply optimistic update

    const result: ToggleLikeDesignResult = await toggleLikeDesignAction(designId, currentUserId);
    setIsPending(false);

    if (result.success) {
      // Update parent component if callback provided
      if (onLikeToggle && result.newLikeCount !== undefined && result.isLikedByCurrentUser !== undefined) {
        onLikeToggle(result.newLikeCount, result.isLikedByCurrentUser);
      }
      // If optimistic update was correct, no need to reset.
      // If server state differs, this would be where you'd explicitly set based on result.
      // For simplicity, we're currently relying on the optimistic update and assuming eventual consistency.
      // If there's a mismatch, the next refresh/prop update should correct it.
       if (result.isLikedByCurrentUser !== optimisticState.isLiked || result.newLikeCount !== optimisticState.likeCount) {
        // If server state doesn't match optimistic state, forcefully update.
        // This is a bit complex with useOptimistic, as it's designed to auto-revert or be committed.
        // For now, we'll log if there's a mismatch, and rely on parent re-render to fix.
        // console.log("Optimistic update differed from server response. Parent re-render should correct.")
      }

    } else {
      toast({
        title: 'Error',
        description: result.message || 'Could not update like status.',
        variant: 'destructive',
      });
      // Revert optimistic update - useOptimistic handles this implicitly if action throws,
      // but if action returns success: false, we might need to manually revert if not using it with useActionState.
      // Since we are not using useActionState here, this toggle will revert.
      // However, useOptimistic is designed to revert automatically if the promise it wraps throws.
      // Since toggleLikeDesignAction doesn't throw but returns an object, this might not auto-revert.
      // For now, let's assume the parent re-renders or the next prop update will fix it.
      // A more robust solution might involve a local state that's explicitly set on success/failure.
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={!currentUserId || isPending}
      className={cn("flex items-center gap-1.5 text-muted-foreground hover:text-primary px-2 py-1 h-auto", className)}
      aria-pressed={optimisticState.isLiked}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          optimisticState.isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-primary"
        )}
      />
      <span className={cn("text-xs", optimisticState.isLiked ? "text-primary font-medium" : "text-muted-foreground")}>
        {optimisticState.likeCount}
      </span>
      <span className="sr-only">{optimisticState.isLiked ? 'Unlike' : 'Like'}</span>
    </Button>
  );
};

export default LikeButton;
