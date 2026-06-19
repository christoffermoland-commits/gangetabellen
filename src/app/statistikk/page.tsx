"use client";

import { useStore } from "@/lib/store";
import { lastNDays, PeriodCounts, summarize } from "@/lib/stats";
import { BackLink, PageShell } from "@/components/ui";

export default function StatistikkPage() {
  const { state, hydrated } = useStore();

  if (!hydrated) {
    return (
      <PageShell>
        <BackLink />
        <div className="flex flex-1 items-center justify-center text-violet-400">Laster …</div>
      </PageShell>
    );
  }

  const stats = summarize(state.sessions);
  const days = lastNDays(state.sessions, 14);
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  return (
    <PageShell>
      <BackLink />
      <h1 className="mb-2 text-center text-3xl font-extrabold text-violet-700">Statistikk 📊</h1>
      <p className="mb-6 text-center text-sm font-semibold text-violet-400">
        Antall fullførte øvinger
      </p>

      {stats.total.total === 0 ? (
        <div className="rounded-3xl bg-white/80 p-6 text-center font-semibold text-violet-400 shadow-sm">
          Ingen øvinger registrert ennå. <br /> Fullfør en runde, så dukker den opp her! 🚀
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <PeriodCard label="I dag" counts={stats.today} />
            <PeriodCard label="Denne uka" counts={stats.week} />
            <PeriodCard label="Denne måneden" counts={stats.month} />
            <PeriodCard label="Totalt" counts={stats.total} />
          </div>

          <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-violet-700">Siste 14 dager</h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-violet-500">
                  <span className="h-3 w-3 rounded-sm bg-violet-500" /> Vanlig
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" /> Hard
                </span>
              </div>
            </div>
            <div className="flex h-32 items-end justify-between gap-1">
              {days.map((d, i) => {
                const isToday = i === days.length - 1;
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-24 w-full flex-col justify-end">
                      {d.hard > 0 && (
                        <div
                          className="w-full rounded-t-sm bg-amber-500"
                          style={{ height: `${(d.hard / maxDay) * 100}%` }}
                        />
                      )}
                      {d.normal > 0 && (
                        <div
                          className={`w-full bg-violet-500 ${d.hard > 0 ? "" : "rounded-t-sm"}`}
                          style={{ height: `${(d.normal / maxDay) * 100}%` }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        isToday ? "text-violet-700" : "text-violet-300"
                      }`}
                    >
                      {Number(d.date.slice(8, 10))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

function PeriodCard({ label, counts }: { label: string; counts: PeriodCounts }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
      <div className="text-sm font-semibold text-violet-400">{label}</div>
      <div className="my-1 text-4xl font-extrabold text-violet-700">{counts.total}</div>
      <div className="flex flex-col gap-1 text-sm font-semibold">
        <span className="flex items-center justify-between text-violet-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Vanlig
          </span>
          <span>{counts.normal}</span>
        </span>
        <span className="flex items-center justify-between text-amber-600">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Hard Mode
          </span>
          <span>{counts.hard}</span>
        </span>
      </div>
    </div>
  );
}
