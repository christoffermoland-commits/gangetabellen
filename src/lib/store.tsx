"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState, RoundSummary, Tabell } from "./types";
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

    // Slå sammen progress per tabell.
    const progress = { ...prev.progress };
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

    const previousResult = prev.lastResult;
    const newRecord =
      previousResult === null || input.score > previousResult.score;

    const next: AppState = {
      ...prev,
      progress,
      dailyStreak: updateDailyStreak(prev.dailyStreak),
      bestSessionStreak: Math.max(prev.bestSessionStreak, input.bestStreakThisRound),
      totalStars: prev.totalStars + input.score,
      lastResult: { date: today, score: input.score, total: input.total },
    };

    const allBadges = evaluateBadges(next);
    const earnedBadges = allBadges.filter((b) => !prev.badges.includes(b));
    next.badges = allBadges;

    const summary: RoundSummary = {
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
