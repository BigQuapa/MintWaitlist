import type { PublicEntry } from './supabase/types';

export function computePosition(waitingEntries: PublicEntry[], myId: string): number {
  const sorted = [...waitingEntries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const idx = sorted.findIndex((e) => e.id === myId);
  return idx === -1 ? 0 : idx + 1;
}

export function estimateWait(position: number, avgWaitMinutes: number): number {
  if (position <= 1) return Math.max(0, avgWaitMinutes);
  return position * avgWaitMinutes;
}

export function firstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[0] ?? fullName;
}

export function minutesAgo(timestamp: string): number {
  const ms = Date.now() - new Date(timestamp).getTime();
  return Math.max(0, Math.floor(ms / 60000));
}
