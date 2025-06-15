
'use client';

import { useOptimistic, useTransition } from 'react';
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

  // useOptimistic's first argument is the "base state". It will re-base if these props change.
  const [optimisticState, toggleOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likeCount: initialLikeCount },
    (state) => ({ // Reducer for optimistic update
      isLiked: !state.isLiked,
      likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
    })
  );

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
      toggleOptimisticState(undefined); // Apply optimistic update

      const result: ToggleLikeDesignResult = await toggleLikeDesignAction(designId, currentUserId);

      if (result.success) {
        if (onLikeToggle && result.newLikeCount !== undefined && result.isLikedByCurrentUser !== undefined) {
          onLikeToggle(result.newLikeCount, result.isLikedByCurrentUser);
        }
        // If server action is successful, the parent component (if it uses onLikeToggle)
        // should update its state, causing new initialIsLiked/initialLikeCount props to be passed down.
        // useOptimistic will reconcile with these new base props.
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Could not update like status.',
          variant: 'destructive',
        });
        // If action failed, useOptimistic automatically reverts to its base state (props)
        // as the underlying data hasn't changed as optimistically predicted.
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
        {optimisticState.likeCount}
      </span>
      <span className="sr-only">{optimisticState.isLiked ? 'Unlike' : 'Like'}</span>
    </Button>
  );
};

export default LikeButton;
