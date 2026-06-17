import { AppState, Tabell, TABELLER, TabellProgress } from "./types";

const STORAGE_KEY = "gangetabellen.state.v1";

function emptyProgress(): Record<Tabell, TabellProgress> {
  return TABELLER.reduce((acc, t) => {
    acc[t] = { spurt: 0, riktig: 0, sistOvd: null };
    return acc;
  }, {} as Record<Tabell, TabellProgress>);
}

export function defaultState(): AppState {
  return {
    progress: emptyProgress(),
    dailyStreak: { sisteOvingsdato: null, antallDagerIRad: 0 },
    bestSessionStreak: 0,
    totalStars: 0,
    badges: [],
    lastResult: null,
    selectedTables: [...TABELLER],
  };
}

/** Slår sammen lagret state med defaults, så nye felter ikke krasjer eldre data. */
function merge(stored: Partial<AppState>): AppState {
  const base = defaultState();
  const progress = emptyProgress();
  if (stored.progress) {
    for (const t of TABELLER) {
      if (stored.progress[t]) progress[t] = { ...progress[t], ...stored.progress[t] };
    }
  }
  return {
    ...base,
    ...stored,
    progress,
    dailyStreak: { ...base.dailyStreak, ...stored.dailyStreak },
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
    return merge(JSON.parse(raw) as Partial<AppState>);
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
