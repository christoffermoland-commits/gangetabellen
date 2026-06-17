import { AppState, ModeStats, Tabell, TABELLER, TabellProgress } from "./types";

const STORAGE_KEY = "gangetabellen.state.v1";

function emptyProgress(): Record<Tabell, TabellProgress> {
  return TABELLER.reduce((acc, t) => {
    acc[t] = { spurt: 0, riktig: 0, sistOvd: null };
    return acc;
  }, {} as Record<Tabell, TabellProgress>);
}

export function emptyModeStats(): ModeStats {
  return {
    progress: emptyProgress(),
    bestSessionStreak: 0,
    totalStars: 0,
    lastResult: null,
    badges: [],
  };
}

export function defaultState(): AppState {
  return {
    normal: emptyModeStats(),
    hard: emptyModeStats(),
    dailyStreak: { sisteOvingsdato: null, antallDagerIRad: 0 },
    selectedTables: [...TABELLER],
    hardMode: false,
  };
}

/** Slår sammen lagret ModeStats med en tom basis, så nye/manglende felter er trygge. */
function mergeMode(stored: Partial<ModeStats> | undefined): ModeStats {
  const base = emptyModeStats();
  if (!stored) return base;
  const progress = emptyProgress();
  if (stored.progress) {
    for (const t of TABELLER) {
      if (stored.progress[t]) progress[t] = { ...progress[t], ...stored.progress[t] };
    }
  }
  return {
    progress,
    bestSessionStreak: stored.bestSessionStreak ?? base.bestSessionStreak,
    totalStars: stored.totalStars ?? base.totalStars,
    lastResult: stored.lastResult ?? base.lastResult,
    badges: stored.badges ?? base.badges,
  };
}

/**
 * Eldre lagret state hadde fremgang på toppnivå (før modus-skillet).
 * Den migreres inn i «normal»-modus.
 */
type LegacyState = Partial<AppState> & Partial<ModeStats>;

function merge(stored: LegacyState): AppState {
  const base = defaultState();
  const hasModes = stored.normal !== undefined || stored.hard !== undefined;

  const normal = hasModes
    ? mergeMode(stored.normal)
    : mergeMode({
        progress: stored.progress,
        bestSessionStreak: stored.bestSessionStreak,
        totalStars: stored.totalStars,
        lastResult: stored.lastResult,
        badges: stored.badges,
      });

  return {
    normal,
    hard: mergeMode(stored.hard),
    dailyStreak: { ...base.dailyStreak, ...stored.dailyStreak },
    hardMode: stored.hardMode ?? base.hardMode,
    selectedTables:
      stored.selectedTables && stored.selectedTables.length > 0
        ? stored.selectedTables.filter((t): t is Tabell => TABELLER.includes(t as Tabell))
        : base.selectedTables,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return merge(JSON.parse(raw) as LegacyState);
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage utilgjengelig/full – ignorer stille.
  }
}
