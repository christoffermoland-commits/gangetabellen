import { AppState, TABELLER } from "./types";
import { isMastered } from "./mastery";
import { currentDailyStreak } from "./streak";

export interface BadgeDef {
  id: string;
  emoji: string;
  label: string;
  description: string;
  earned: (s: AppState) => boolean;
}

export const BADGES: BadgeDef[] = [
  ...TABELLER.map((t) => ({
    id: `mestret-${t}`,
    emoji: "🏅",
    label: `${t}-gangen mestret`,
    description: `90 %+ riktig på ${t}-gangen`,
    earned: (s: AppState) => isMastered(s.progress[t]),
  })),
  {
    id: "perfekt-runde",
    emoji: "💯",
    label: "Perfekt runde",
    description: "Alle 25 riktige i én runde",
    earned: (s) => s.bestSessionStreak >= 25,
  },
  {
    id: "streak-3",
    emoji: "🔥",
    label: "3 dager på rad",
    description: "Øvd 3 dager i strekk",
    earned: (s) => currentDailyStreak(s.dailyStreak) >= 3,
  },
  {
    id: "streak-7",
    emoji: "⚡",
    label: "Hel uke",
    description: "Øvd 7 dager i strekk",
    earned: (s) => currentDailyStreak(s.dailyStreak) >= 7,
  },
  {
    id: "stjerner-50",
    emoji: "⭐",
    label: "50 stjerner",
    description: "Samlet 50 stjerner totalt",
    earned: (s) => s.totalStars >= 50,
  },
  {
    id: "stjerner-100",
    emoji: "🌟",
    label: "100 stjerner",
    description: "Samlet 100 stjerner totalt",
    earned: (s) => s.totalStars >= 100,
  },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Alle badge-id-er som er opptjent i nåværende state. */
export function evaluateBadges(state: AppState): string[] {
  return BADGES.filter((b) => b.earned(state)).map((b) => b.id);
}
