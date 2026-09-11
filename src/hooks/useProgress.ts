import { useState, useEffect, useCallback } from 'react';
import type { Progress, ModuleProgress } from '@/types';

const STORAGE_KEY = 'goethe-a1-progress';

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress]);

  const recordScore = useCallback((key: string, score: number, total: number) => {
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
    setProgress((prev) => {
      const existing = prev[key];
      const safeScore = Math.max(0, Math.min(total, score));
      const answered = (existing?.answered ?? 0) + total;
      const correct = (existing?.correct ?? 0) + safeScore;
      const scorePercent = Math.round((safeScore / total) * 100);
      return {
        ...prev,
        [key]: {
          completed: answered,
          total: answered,
          answered,
          correct,
          bestScore: Math.max(existing?.bestScore ?? 0, scorePercent),
          lastScore: scorePercent,
          attempts: (existing?.attempts ?? 0) + 1,
        } as ModuleProgress,
      };
    });
  }, []);

  const markCompleted = useCallback((key: string, total: number) => {
    recordScore(key, total, total);
  }, [recordScore]);

  const resetProgress = useCallback(() => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { progress, recordScore, markCompleted, resetProgress };
}
