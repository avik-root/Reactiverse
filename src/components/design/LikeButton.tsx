
'use client';

import { useState, useEffect, useOptimistic, useTransition } from 'react'; // Import useTransition
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toggleLikeDesignAction, type ToggleLikeDesignResult } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface LikeButtonProps {
  designId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  currentUserId?: string;
  onLikeToggle?: (newLikeCount: number, newIsLiked: boolean) => void;
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
  const [isTransitionPending, startTransition] = useTransition();

  const currentUserId = propCurrentUserId || (authUser && 'id' in authUser ? authUser.id : undefined);

  const [optimisticState, toggleOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likeCount: initialLikeCount },
    (state) => ({
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
    })
  );

  // This useEffect is to ensure that if the props themselves change
  // (e.g. parent component re-fetched data), the optimistic hook's base state
  // is correctly reflecting the latest props. useOptimistic takes its base
  // state from its first argument on each render.
  useEffect(() => {
    // The base state for useOptimistic is { isLiked: initialIsLiked, likeCount: initialLikeCount }.
    // If these props change, useOptimistic will use the new values as its base.
    // No explicit action needed here to "sync" optimisticState with props,
    // as useOptimistic handles this by comparing its internal state with the base state.
  }, [initialIsLiked, initialLikeCount]);


  const handleLike = () => { // Made non-async, startTransition handles the async work
    if (!currentUserId) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like designs.',
        variant: 'destructive',
      });
      return;
    }

    if (isTransitionPending) return;

    startTransition(async () => {
      toggleOptimisticState(undefined); // Apply optimistic update

      const result: ToggleLikeDesignResult = await toggleLikeDesignAction(designId, currentUserId);

      if (result.success) {
        if (onLikeToggle && result.newLikeCount !== undefined && result.isLikedByCurrentUser !== undefined) {
          onLikeToggle(result.newLikeCount, result.isLikedByCurrentUser);
        }
        // If the action was successful, and onLikeToggle updates parent state,
        // new props (initialIsLiked, initialLikeCount) will flow down.
        // useOptimistic will see that its base state now matches the (former) optimistic state,
        // effectively "committing" the optimistic update.
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Could not update like status.',
          variant: 'destructive',
        });
        // If action failed, onLikeToggle might not be called or parent state won't match optimistic update.
        // When startTransition completes, useOptimistic will compare its internal optimistic value
        // with its base state (derived from initialIsLiked/initialLikeCount props).
        // If they don't match (because the "true" state didn't update as optimistically predicted),
        // React will revert the optimistic update, showing the UI based on the (unchanged or differently changed) props.
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={!currentUserId || isTransitionPending} // Use isTransitionPending
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

