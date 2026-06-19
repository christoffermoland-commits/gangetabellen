"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState, GameMode, ModeStats, RoundSummary, Tabell } from "./types";
import { defaultState, loadState, saveState } from "./storage";
import { updateDailyStreak } from "./streak";
import { evaluateBadges } from "./badges";
import { dateKey } from "./date";

export interface RoundInput {
  score: number;
  total: number;
  bestStreakThisRound: number;
  perTable: Record<number, { spurt: number; riktig: number }>;
}

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  /** Oppsummering av sist fullførte runde (kun i minnet, til Resultat-skjermen). */
  lastRoundSummary: RoundSummary | null;
  setSelectedTables: (tables: Tabell[]) => void;
  setHardMode: (on: boolean) => void;
  finishRound: (input: RoundInput) => RoundSummary;
  clearRoundSummary: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  // Holdes i en ref så den overlever route-bytter uten å trigge re-render i utide.
  const [lastRoundSummary, setLastRoundSummary] = useState<RoundSummary | null>(null);

  // Hydrer fra localStorage etter mount (utilgjengelig under SSR).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persistér når state endres (etter hydrering).
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setSelectedTables = useCallback((tables: Tabell[]) => {
    setState((s) => ({ ...s, selectedTables: tables }));
  }, []);

  const setHardMode = useCallback((on: boolean) => {
    setState((s) => ({ ...s, hardMode: on }));
  }, []);

  const finishRound = useCallback(
    (input: RoundInput): RoundSummary => {
    const prev = state;
    const today = dateKey();
    const mode: GameMode = prev.hardMode ? "hard" : "normal";
    const prevStats = prev[mode];

    // Slå sammen progress per tabell – innenfor aktiv modus.
    const progress = { ...prevStats.progress };
    for (const key of Object.keys(input.perTable)) {
      const t = Number(key) as Tabell;
      const add = input.perTable[t];
      const cur = progress[t];
      progress[t] = {
        spurt: cur.spurt + add.spurt,
        riktig: cur.riktig + add.riktig,
        sistOvd: today,
      };
    }

    const previousResult = prevStats.lastResult;
    const newRecord = previousResult === null || input.score > previousResult.score;

    const dailyStreak = updateDailyStreak(prev.dailyStreak);
    const nextStats: ModeStats = {
      progress,
      bestSessionStreak: Math.max(prevStats.bestSessionStreak, input.bestStreakThisRound),
      totalStars: prevStats.totalStars + input.score,
      lastResult: { date: today, score: input.score, total: input.total },
      badges: prevStats.badges,
    };

    const allBadges = evaluateBadges(nextStats, dailyStreak);
    const earnedBadges = allBadges.filter((b) => !prevStats.badges.includes(b));
    nextStats.badges = allBadges;

    const next: AppState = {
      ...prev,
      [mode]: nextStats,
      dailyStreak,
      sessions: [...prev.sessions, { date: today, mode }],
    };

    const summary: RoundSummary = {
      mode,
      score: input.score,
      total: input.total,
      bestStreakThisRound: input.bestStreakThisRound,
      starsEarned: input.score,
      newRecord,
      previousResult,
      earnedBadges,
      perTable: input.perTable,
    };

    setState(next);
    setLastRoundSummary(summary);
    return summary;
    },
    [state],
  );

  const clearRoundSummary = useCallback(() => setLastRoundSummary(null), []);

  const resetAll = useCallback(() => {
    setState(defaultState());
    setLastRoundSummary(null);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      hydrated,
      lastRoundSummary,
      setSelectedTables,
      setHardMode,
      finishRound,
      clearRoundSummary,
      resetAll,
    }),
    [
      state,
      hydrated,
      lastRoundSummary,
      setSelectedTables,
      setHardMode,
      finishRound,
      clearRoundSummary,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore må brukes innenfor StoreProvider");
  return ctx;
}
