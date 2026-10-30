// lib/upvote.ts
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { StartupItem } from '@/lib/type';

const STORAGE_KEY = 'voted-startups';

/** Persists an upvote. Same write as before: upvotes = current + 1. */
export async function persistUpvote(id: string, currentUpvotes: number) {
  try {
    await supabase.from('startups').update({ upvotes: currentUpvotes + 1 }).eq('id', id);
  } catch (err) {
    console.error('Upvote error:', err);
  }
}

/** Browser-local memory of which products this visitor already upvoted (UI only). */
export function getVotedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function rememberVote(id: string) {
  try {
    const ids = getVotedIds();
    ids.add(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // storage unavailable — ignore
  }
}

/** List state + optimistic upvote handler shared by list pages. */
export function useStartupList(initial: StartupItem[]) {
  const [startups, setStartups] = useState<StartupItem[]>(initial);

  const handleUpvote = useCallback(async (id: string, currentUpvotes: number) => {
    setStartups((prev) => prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item)));
    await persistUpvote(id, currentUpvotes);
  }, []);

  return { startups, handleUpvote };
}

