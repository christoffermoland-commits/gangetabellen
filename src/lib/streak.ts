import { DailyStreak } from "./types";
import { dateKey, yesterdayKey } from "./date";

/**
 * Oppdaterer kalenderbasert daglig streak når en runde fullføres.
 * - Samme dag igjen: uendret.
 * - Dagen etter forrige økt: +1.
 * - Hopp over en eller flere dager (eller første gang): nullstilles til 1.
 */
export function updateDailyStreak(streak: DailyStreak, now: Date = new Date()): DailyStreak {
  const today = dateKey(now);
  const yesterday = yesterdayKey(now);

  if (streak.sisteOvingsdato === today) {
    return streak;
  }
  if (streak.sisteOvingsdato === yesterday) {
    return { sisteOvingsdato: today, antallDagerIRad: streak.antallDagerIRad + 1 };
  }
  return { sisteOvingsdato: today, antallDagerIRad: 1 };
}

/**
 * Visningsverdi for hjemskjermen: hvis siste økt verken var i dag eller i går,
 * er den daglige streaken brutt og vises som 0.
 */
export function currentDailyStreak(streak: DailyStreak, now: Date = new Date()): number {
  const today = dateKey(now);
  const yesterday = yesterdayKey(now);
  if (streak.sisteOvingsdato === today || streak.sisteOvingsdato === yesterday) {
    return streak.antallDagerIRad;
  }
  return 0;
}
