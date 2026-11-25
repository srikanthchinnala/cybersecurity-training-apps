import { useEffect, useState, useCallback } from 'react';

const KEY = 'cybertrainer.progress.v1';
const EMPTY = { xp: 0, done: {}, streak: 0, lastDay: null };

export const RANKS = ['Recruit', 'Analyst I', 'Analyst II', 'Threat Hunter', 'Incident Responder', 'Security Lead'];

export function levelFor(xp) {
  const level = Math.floor(xp / 100) + 1;
  return { level, rank: RANKS[Math.min(level - 1, RANKS.length - 1)], into: xp % 100 };
}

function load() {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return EMPTY; }
}

// Progress store: XP, completed items (by key) and a daily streak, persisted in localStorage.
export function useProgress() {
  const [p, setP] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
  }, [p]);

  // Award XP once per unique key (e.g. "phishing:lesson:0")
  const award = useCallback((key, amount) => {
    setP((prev) => {
      if (prev.done[key]) return prev;
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      const streak = prev.lastDay === today ? prev.streak : prev.lastDay === yesterday ? prev.streak + 1 : 1;
      return { ...prev, xp: prev.xp + amount, done: { ...prev.done, [key]: true }, streak, lastDay: today };
    });
  }, []);

  const reset = useCallback(() => setP(EMPTY), []);
  const isDone = useCallback((key) => Boolean(p.done[key]), [p]);

  return { ...p, award, reset, isDone };
}
