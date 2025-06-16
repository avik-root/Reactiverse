
'use client';

import { useOptimistic, useTransition, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toggleLikeDesignAction, type ToggleLikeDesignResult } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  designId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  onLikeToggle?: (newLikeCount: number, newIsLiked: boolean) => void;
  className?: string;
  currentUserId?: string; // Added currentUserId prop
}

const LikeButton: React.FC<LikeButtonProps> = ({
  designId,
  initialLikeCount,
  initialIsLiked,
  onLikeToggle,
  className,
  currentUserId, // Use the passed prop
}) => {
  const { toast } = useToast();
  const [isTransitionPending, startTransition] = useTransition();

  const [optimisticState, toggleOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likeCount: initialLikeCount },
    (state) => ({
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? Math.max(0, state.likeCount - 1) : state.likeCount + 1,
    })
  );

  // This effect ensures that if the initial props change (e.g., parent re-fetches data),
  // the optimistic state's base is updated.
  useEffect(() => {
    // Check if optimistic state is out of sync with new initial props
    if (optimisticState.isLiked !== initialIsLiked || optimisticState.likeCount !== initialLikeCount) {
      // This is a bit of a manual way to reset the base for useOptimistic if props change.
      // A more direct way would be for useOptimistic to naturally re-base,
      // but this explicit call can help ensure it reflects external changes.
      // We are essentially telling the optimistic hook "your new base reality is this".
      // We're not calling toggleOptimisticState with an action, but rather providing
      // a new state object directly. This is not standard use of the second argument of useOptimistic.
      // A cleaner way might be to re-key the component or ensure the parent updates props reliably.
      // For now, let's rely on useOptimistic's default behavior to re-base when its initial input props change.
      // The `key` prop on the LikeButton (if parent changes it) or just prop changes should cause re-basing.
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
      } else if (!result.success) {
        toast({
          title: 'Error',
          description: result.message || 'Could not update like status.',
          variant: 'destructive',
        });
        // Optimistic state will automatically revert if the action fails or if the underlying data source
        // it's based on (initialLikeCount, initialIsLiked) doesn't change as expected.
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
        {optimisticState.likeCount < 0 ? 0 : optimisticState.likeCount}
      </span>
      <span className="sr-only">{optimisticState.isLiked ? 'Unlike' : 'Like'}</span>
    </Button>
  );
};

export default LikeButton;
