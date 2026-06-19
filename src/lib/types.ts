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

/** Logg over hver fullførte øvingsrunde – grunnlag for statistikk over tid. */
export interface SessionEntry {
  date: string; // "YYYY-MM-DD"
  mode: GameMode;
}

export type GameMode = "normal" | "hard";

/** Rekorder og fremgang som holdes adskilt per modus (vanlig vs Hard Mode). */
export interface ModeStats {
  progress: Record<Tabell, TabellProgress>;
  bestSessionStreak: number;
  totalStars: number;
  /** Forrige fullførte runde i denne modusen – brukes til «slå din egen rekord». */
  lastResult: RoundResult | null;
  badges: string[];
}

export interface AppState {
  /** Statistikk per modus. */
  normal: ModeStats;
  hard: ModeStats;
  /** Daglig øve-streak deles på tvers av modus (å øve teller uansett modus). */
  dailyStreak: DailyStreak;
  /** Logg over alle fullførte runder, brukt av statistikk-siden. */
  sessions: SessionEntry[];
  /** Tabeller valgt på hjemskjermen sist. */
  selectedTables: Tabell[];
  /** Hard Mode: skriv svaret selv i stedet for å velge mellom alternativer. */
  hardMode: boolean;
}

/** Oppsummering av én runde, holdt i minnet mellom Øving → Resultat. */
export interface RoundSummary {
  mode: GameMode;
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
