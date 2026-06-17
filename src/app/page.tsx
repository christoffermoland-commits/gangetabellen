"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { TABELLER, Tabell } from "@/lib/types";
import { bossTable, masteryPercent } from "@/lib/mastery";
import { currentDailyStreak } from "@/lib/streak";
import { PageShell, TABLE_COLORS } from "@/components/ui";

export default function HomePage() {
  const { state, hydrated, setSelectedTables, setHardMode } = useStore();
  const router = useRouter();

  if (!hydrated) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center text-violet-400">Laster …</div>
      </PageShell>
    );
  }

  const stats = state.hardMode ? state.hard : state.normal;
  const boss = bossTable(stats.progress);
  const selected = state.selectedTables;
  const dagStreak = currentDailyStreak(state.dailyStreak);

  const toggle = (t: Tabell) => {
    const next = selected.includes(t)
      ? selected.filter((x) => x !== t)
      : [...selected, t].sort((a, b) => a - b);
    setSelectedTables(next);
  };

  const allSelected = selected.length === TABELLER.length;
  const toggleAll = () => setSelectedTables(allSelected ? [] : [...TABELLER]);

  const start = () => {
    if (selected.length === 0) return;
    router.push("/ovelse");
  };

  return (
    <PageShell>
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-violet-700">Gangetabellen</h1>
        <p className="mt-1 text-violet-400">La oss øve! ✨</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/80 p-4 text-center shadow-sm">
          <div className="text-3xl">🔥</div>
          <div className="text-2xl font-extrabold text-orange-500">{dagStreak}</div>
          <div className="text-xs font-semibold text-violet-400">
            {dagStreak === 1 ? "dag på rad" : "dager på rad"}
          </div>
        </div>
        <div className="rounded-3xl bg-white/80 p-4 text-center shadow-sm">
          <div className="text-3xl">⭐</div>
          <div className="text-2xl font-extrabold text-amber-500">{stats.totalStars}</div>
          <div className="text-xs font-semibold text-violet-400">stjerner</div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-violet-700">Velg tabeller</h2>
        <button
          onClick={toggleAll}
          className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-violet-600 shadow-sm active:scale-95"
        >
          {allSelected ? "Fjern alle" : "Velg alle"}
        </button>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {TABELLER.map((t) => {
          const c = TABLE_COLORS[t];
          const isSel = selected.includes(t);
          const isBoss = boss === t;
          const pct = masteryPercent(stats.progress[t]);
          return (
            <button
              key={t}
              onClick={() => toggle(t)}
              aria-pressed={isSel}
              className={`relative flex items-center gap-3 rounded-2xl border-4 p-3 text-left transition active:scale-[0.97] ${
                isSel
                  ? `${c.bg} border-white text-white shadow-md`
                  : "border-transparent bg-white/70 text-violet-700"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold ${
                  isSel ? "bg-white/30 text-white" : `${c.bg} text-white`
                }`}
              >
                {t}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-tight">{t}-gangen</span>
                <span className={`text-xs ${isSel ? "text-white/90" : "text-violet-400"}`}>
                  {stats.progress[t].spurt > 0 ? `${pct}%` : "ny"}
                </span>
              </span>
              {isBoss && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow animate-wiggle">
                  👑
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setHardMode(!state.hardMode)}
        role="switch"
        aria-checked={state.hardMode}
        className={`mb-6 flex items-center justify-between rounded-2xl border-4 p-4 text-left transition active:scale-[0.98] ${
          state.hardMode
            ? "border-white bg-violet-600 text-white shadow-md"
            : "border-transparent bg-white/70 text-violet-700"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-lg font-bold">💪 Hard Mode</span>
          <span className={`text-sm ${state.hardMode ? "text-white/90" : "text-violet-400"}`}>
            Skriv svaret selv – ingen alternativer
          </span>
        </span>
        <span
          className={`relative ml-3 h-8 w-14 shrink-0 rounded-full transition ${
            state.hardMode ? "bg-white/40" : "bg-violet-200"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
              state.hardMode ? "left-7" : "left-1"
            }`}
          />
        </span>
      </button>

      {stats.lastResult && (
        <p className="mb-3 text-center text-sm font-semibold text-violet-400">
          Forrige {state.hardMode ? "Hard Mode-runde" : "runde"}: {stats.lastResult.score} av{" "}
          {stats.lastResult.total}. Klarer du å slå den? 💪
        </p>
      )}

      <button
        onClick={start}
        disabled={selected.length === 0}
        className="mb-3 rounded-full bg-violet-600 py-5 text-2xl font-extrabold text-white shadow-lg transition active:scale-95 disabled:opacity-40"
      >
        Start øving 🚀
      </button>

      <Link
        href="/rekorder"
        className="rounded-full bg-white/70 py-4 text-center text-lg font-bold text-violet-700 shadow-sm active:scale-95"
      >
        🏆 Mine rekorder
      </Link>
    </PageShell>
  );
}
