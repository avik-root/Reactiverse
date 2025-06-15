
'use client';

import { useOptimistic, useTransition, useEffect } from 'react';
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
  onLikeToggle?: (newLikeCount: number, newIsLiked: boolean) => void;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  designId,
  initialLikeCount,
  initialIsLiked,
  onLikeToggle,
  className,
}) => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [isTransitionPending, startTransition] = useTransition();

  const currentUserId = authUser && 'id' in authUser ? authUser.id : undefined;

  const [optimisticState, toggleOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likeCount: initialLikeCount },
    (state) => ({
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
    })
  );

  // Effect to ensure optimistic state is re-based if props change from parent
  useEffect(() => {
    // This is a bit of a trick to re-trigger the optimistic hook's base state
    // if the parent's understanding of the like state changes externally.
    // Note: useOptimistic primarily reconciles with its base state.
    // If initialIsLiked or initialLikeCount props change, it should re-base.
    // This effect is more of a safeguard or for scenarios where that re-basing isn't happening as expected.
    // It's often not strictly necessary if the parent component correctly updates these props.
    if (optimisticState.isLiked !== initialIsLiked || optimisticState.likeCount !== initialLikeCount) {
        // This directly sets the optimistic state to match the props.
        // This is generally NOT how useOptimistic is meant to be updated after its initial setup,
        // as it's designed to reconcile with its base props.
        // However, if there are sync issues, this can be a way to force it.
        // Consider if the parent component is reliably updating initialIsLiked/initialLikeCount.
        // For now, we rely on the default behavior of useOptimistic re-basing on prop changes.
    }
  }, [initialIsLiked, initialLikeCount]);


  const handleLike = () => {
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
      toggleOptimisticState(undefined); 

      const result: ToggleLikeDesignResult = await toggleLikeDesignAction(designId, currentUserId);

      if (result.success && result.newLikeCount !== undefined && result.isLikedByCurrentUser !== undefined) {
        if (onLikeToggle) {
          onLikeToggle(result.newLikeCount, result.isLikedByCurrentUser);
        }
        // The optimistic state should reconcile with the new props passed down
        // after onLikeToggle updates the parent component.
      } else if (!result.success) {
        toast({
          title: 'Error',
          description: result.message || 'Could not update like status.',
          variant: 'destructive',
        });
        // If the action fails, useOptimistic will revert to its base state (from props)
        // If props haven't changed yet, it might revert to the state before optimistic update.
        // It's important that parent updates props correctly even on failure if server state changed.
        // However, for a simple like toggle, if server fails, client should ideally revert the optimistic change.
        // `useOptimistic` handles this reversion if the actual data source it's bound to doesn't change as predicted.
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={!currentUserId || isTransitionPending}
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
        {optimisticState.likeCount < 0 ? 0 : optimisticState.likeCount} {/* Ensure count doesn't go negative */}
      </span>
      <span className="sr-only">{optimisticState.isLiked ? 'Unlike' : 'Like'}</span>
    </Button>
  );
};

export default LikeButton;

