import { ModeStats, Tabell, TABELLER, TabellProgress } from "./types";

/** Minste antall spørsmål før en tabell kan regnes som «mestret». */
export const MASTERY_MIN_ATTEMPTS = 100;
export const MASTERY_THRESHOLD = 90; // prosent

export function masteryPercent(p: TabellProgress): number {
  if (p.spurt === 0) return 0;
  return Math.round((p.riktig / p.spurt) * 100);
}

export function isMastered(p: TabellProgress): boolean {
  return p.spurt >= MASTERY_MIN_ATTEMPTS && masteryPercent(p) >= MASTERY_THRESHOLD;
}

export function errorCount(p: TabellProgress): number {
  return p.spurt - p.riktig;
}

/**
 * Boss-tabellen er tabellen med flest feil. Krever minst én feil.
 * Ved likt antall feil velges tabellen med lavest mestringsgrad.
 */
export function bossTable(progress: Record<Tabell, TabellProgress>): Tabell | null {
  let boss: Tabell | null = null;
  let bestErrors = 0;
  let bestPercent = 101;
  for (const t of TABELLER) {
    const errors = errorCount(progress[t]);
    if (errors <= 0) continue;
    const pct = masteryPercent(progress[t]);
    if (errors > bestErrors || (errors === bestErrors && pct < bestPercent)) {
      boss = t;
      bestErrors = errors;
      bestPercent = pct;
    }
  }
  return boss;
}

export function masteredCount(stats: ModeStats): number {
  return TABELLER.filter((t) => isMastered(stats.progress[t])).length;
}
