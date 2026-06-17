"use client";

import { useStore } from "@/lib/store";
import { TABELLER } from "@/lib/types";
import { bossTable, isMastered, masteryPercent } from "@/lib/mastery";
import { BADGES } from "@/lib/badges";
import { BackLink, PageShell, TABLE_COLORS } from "@/components/ui";

export default function RekorderPage() {
  const { state, hydrated } = useStore();

  if (!hydrated) {
    return (
      <PageShell>
        <BackLink />
        <div className="flex flex-1 items-center justify-center text-violet-400">Laster …</div>
      </PageShell>
    );
  }

  const boss = bossTable(state.progress);
  const earned = new Set(state.badges);

  return (
    <PageShell>
      <BackLink />
      <h1 className="mb-6 text-center text-3xl font-extrabold text-violet-700">Mine rekorder 🏆</h1>

      <div className="mb-6 rounded-3xl bg-white/80 p-5 text-center shadow-sm">
        <div className="text-3xl">🔥</div>
        <div className="text-3xl font-extrabold text-orange-500">{state.bestSessionStreak}</div>
        <div className="text-sm font-semibold text-violet-400">beste streak noensinne</div>
      </div>

      <h2 className="mb-3 text-lg font-bold text-violet-700">Mestringsgrad</h2>
      <div className="mb-6 flex flex-col gap-3">
        {TABELLER.map((t) => {
          const p = state.progress[t];
          const pct = masteryPercent(p);
          const c = TABLE_COLORS[t];
          const mastered = isMastered(p);
          return (
            <div key={t} className="rounded-3xl bg-white/80 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-extrabold text-white ${c.bg}`}
                >
                  {t}
                </span>
                <span className="font-bold text-violet-700">{t}-gangen</span>
                {mastered && <span className="text-xl">🏅</span>}
                {boss === t && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    👑 BOSS
                  </span>
                )}
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-violet-100">
                <div
                  className={`h-full rounded-full ${c.bg} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs font-semibold text-violet-400">
                {p.spurt > 0 ? `${pct}% (${p.riktig}/${p.spurt})` : "ikke øvd ennå"}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 text-lg font-bold text-violet-700">Merkesamling</h2>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              className={`flex flex-col items-center rounded-3xl p-3 text-center shadow-sm ${
                has ? "bg-white" : "bg-white/40"
              }`}
            >
              <span className={`text-4xl ${has ? "" : "opacity-25 grayscale"}`}>{b.emoji}</span>
              <span
                className={`mt-1 text-[11px] font-semibold leading-tight ${
                  has ? "text-violet-600" : "text-violet-300"
                }`}
              >
                {has ? b.label : "Låst"}
              </span>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
