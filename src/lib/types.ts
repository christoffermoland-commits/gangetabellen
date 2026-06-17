export type Tabell = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const TABELLER: Tabell[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface TabellProgress {
  spurt: number;
  riktig: number;
  sistOvd: string | null; // ISO-dato "YYYY-MM-DD"
}

export interface DailyStreak {
  sisteOvingsdato: string | null; // "YYYY-MM-DD"
  antallDagerIRad: number;
}

export interface RoundResult {
  date: string; // "YYYY-MM-DD"
  score: number;
  total: number;
}

export interface AppState {
  progress: Record<Tabell, TabellProgress>;
  dailyStreak: DailyStreak;
  bestSessionStreak: number;
  totalStars: number;
  badges: string[];
  /** Forrige fullførte runde – brukes til «slå din egen rekord». */
  lastResult: RoundResult | null;
  /** Tabeller valgt på hjemskjermen sist. */
  selectedTables: Tabell[];
}

/** Oppsummering av én runde, holdt i minnet mellom Øving → Resultat. */
export interface RoundSummary {
  score: number;
  total: number;
  bestStreakThisRound: number;
  starsEarned: number;
  newRecord: boolean;
  previousResult: RoundResult | null;
  earnedBadges: string[];
  perTable: Record<number, { spurt: number; riktig: number }>;
}

export interface Question {
  table: number;
  factor: number;
  answer: number;
  options: number[];
}
