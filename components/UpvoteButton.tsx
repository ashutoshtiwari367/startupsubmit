'use client';

import { useState, useSyncExternalStore } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from 'cn';
import { getVotedIds, persistUpvote, rememberVote } from '@/lib/upvote';

interface UpvoteButtonProps {
  startupId: string;
  startupName: string;
  count: number;
  variant?: 'vertical' | 'inline' | 'hero';
  onUpvote?: (id: string, currentUpvotes: number) => void;
  className?: string;
}

const emptySubscribe = () => () => {};

export function UpvoteButton({
  startupId,
  startupName,
  count,
  variant = 'vertical',
  onUpvote,
  className,
}: UpvoteButtonProps) {
  const persistedVoted = useSyncExternalStore(
    emptySubscribe,
    () => getVotedIds().has(startupId),
    () => false
  );
  const [votedThisSession, setVotedThisSession] = useState(false);
  const [uncontrolledBonus, setUncontrolledBonus] = useState(0);
  const [popping, setPopping] = useState(false);

  const voted = persistedVoted || votedThisSession;
  const displayCount = count + uncontrolledBonus;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;

    const previous = displayCount;
    setVotedThisSession(true);
    setPopping(true);
    rememberVote(startupId);

    if (onUpvote) {
      onUpvote(startupId, previous);
    } else {
      setUncontrolledBonus((b) => b + 1);
      persistUpvote(startupId, previous);
    }
  };

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={voted}
        aria-label={voted ? `Upvoted ${startupName} (${displayCount})` : `Upvote ${startupName} (${displayCount})`}
        className={cn(
          'inline-flex h-11 items-center gap-2.5 rounded-lg border px-4 text-sm font-semibold tabular-nums transition-[color,background-color,border-color,box-shadow] duration-150 select-none',
          voted
            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
            : 'border-border-strong bg-card text-foreground shadow-xs hover:border-primary hover:bg-primary-soft hover:text-primary-soft-foreground',
          className
        )}
      >
        <ChevronUp
          aria-hidden="true"
          onAnimationEnd={() => setPopping(false)}
          className={cn('size-4 stroke-[2.5]', popping && 'animate-vote-pop')}
        />
        <span>{voted ? 'Upvoted' : 'Upvote'}</span>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-xs font-bold',
            voted ? 'bg-white/20 text-primary-foreground' : 'bg-muted text-foreground'
          )}
        >
          {displayCount}
        </span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={voted}
        aria-label={voted ? `Upvoted ${startupName} (${displayCount})` : `Upvote ${startupName} (${displayCount})`}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold tabular-nums transition-[color,background-color,border-color] duration-150 select-none',
          voted
            ? 'border-primary bg-primary-soft text-primary-soft-foreground'
            : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary-soft/60 hover:text-primary-soft-foreground',
          className
        )}
      >
        <ChevronUp
          aria-hidden="true"
          onAnimationEnd={() => setPopping(false)}
          className={cn('size-3.5 stroke-[2.5]', popping && 'animate-vote-pop')}
        />
        <span>{displayCount}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={voted}
      aria-label={voted ? `Upvoted ${startupName} (${displayCount})` : `Upvote ${startupName} (${displayCount})`}
      className={cn(
        'group/upvote flex h-14 min-w-[3.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-2 text-xs font-semibold tabular-nums transition-[color,background-color,border-color,box-shadow] duration-150 select-none',
        voted
          ? 'border-primary bg-primary-soft text-primary-soft-foreground shadow-xs'
          : 'border-border bg-card text-foreground shadow-xs hover:border-primary/60 hover:bg-primary-soft/60 hover:text-primary-soft-foreground',
        className
      )}
    >
      <ChevronUp
        aria-hidden="true"
        onAnimationEnd={() => setPopping(false)}
        className={cn(
          'size-4 stroke-[2.5] transition-transform duration-150 group-hover/upvote:-translate-y-0.5',
          voted ? 'text-primary' : 'text-muted-foreground group-hover/upvote:text-primary',
          popping && 'animate-vote-pop'
        )}
      />
      <span>{displayCount}</span>
    </button>
  );
}
