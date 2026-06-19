import { GameMode, SessionEntry } from "./types";
import { dateKey, monthKey, startOfWeekKey } from "./date";

export interface PeriodCounts {
  normal: number;
  hard: number;
  total: number;
}

function count(sessions: SessionEntry[], keep: (s: SessionEntry) => boolean): PeriodCounts {
  let normal = 0;
  let hard = 0;
  for (const s of sessions) {
    if (!keep(s)) continue;
    if (s.mode === "hard") hard += 1;
    else normal += 1;
  }
  return { normal, hard, total: normal + hard };
}

export interface StatsSummary {
  today: PeriodCounts;
  week: PeriodCounts;
  month: PeriodCounts;
  total: PeriodCounts;
}

/** Antall fullførte øvinger i dag, denne uka, denne måneden og totalt – per modus. */
export function summarize(sessions: SessionEntry[], now: Date = new Date()): StatsSummary {
  const today = dateKey(now);
  const weekStart = startOfWeekKey(now);
  const month = monthKey(now);
  return {
    today: count(sessions, (s) => s.date === today),
    week: count(sessions, (s) => s.date >= weekStart && s.date <= today),
    month: count(sessions, (s) => s.date.startsWith(month)),
    total: count(sessions, () => true),
  };
}

export interface DayBucket {
  date: string; // "YYYY-MM-DD"
  normal: number;
  hard: number;
  total: number;
}

/** Daglige tellinger for de siste n dagene, eldst først – til søylediagram. */
export function lastNDays(
  sessions: SessionEntry[],
  n: number,
  now: Date = new Date(),
): DayBucket[] {
  const buckets: DayBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const c = count(sessions, (s) => s.date === key);
    buckets.push({ date: key, normal: c.normal, hard: c.hard, total: c.total });
  }
  return buckets;
}

export const MODE_LABEL: Record<GameMode, string> = {
  normal: "Vanlig",
  hard: "Hard Mode",
};
