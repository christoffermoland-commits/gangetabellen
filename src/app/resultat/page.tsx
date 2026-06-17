"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { badgeById } from "@/lib/badges";
import { PageShell } from "@/components/ui";

export default function ResultatPage() {
  const { lastRoundSummary, hydrated, clearRoundSummary } = useStore();
  const router = useRouter();

  // Ingen runde å vise (f.eks. direkte navigasjon eller refresh) → hjem.
  useEffect(() => {
    if (hydrated && !lastRoundSummary) router.replace("/");
  }, [hydrated, lastRoundSummary, router]);

  if (!hydrated || !lastRoundSummary) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center text-violet-400">Laster …</div>
      </PageShell>
    );
  }

  const s = lastRoundSummary;
  const perfect = s.score === s.total;
  const headline = perfect
    ? "Helt perfekt! 🌟"
    : s.score >= s.total * 0.75
      ? "Bra jobba! 🎉"
      : s.score >= s.total * 0.5
        ? "Godt forsøk! 👏"
        : "Fortsett å øve! 💪";

  const playAgain = () => {
    clearRoundSummary();
    router.replace("/ovelse");
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {s.mode === "hard" && (
          <div className="mb-2 rounded-full bg-violet-600 px-4 py-1 text-sm font-bold text-white">
            💪 Hard Mode
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-violet-700 animate-pop-in">{headline}</h1>

        {s.newRecord && (
          <div className="mt-4 rounded-full bg-amber-400 px-6 py-2 text-lg font-extrabold text-white shadow-md animate-wiggle">
            🏆 NY REKORD!
          </div>
        )}

        <div className="my-6 flex h-44 w-44 flex-col items-center justify-center rounded-full bg-white shadow-lg">
          <div className="text-6xl font-extrabold text-violet-600">{s.score}</div>
          <div className="text-lg font-semibold text-violet-300">av {s.total}</div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-2xl">⭐</div>
            <div className="text-xl font-extrabold text-amber-500">+{s.starsEarned}</div>
            <div className="text-xs font-semibold text-violet-400">stjerner</div>
          </div>
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-2xl">🔥</div>
            <div className="text-xl font-extrabold text-orange-500">{s.bestStreakThisRound}</div>
            <div className="text-xs font-semibold text-violet-400">beste streak</div>
          </div>
        </div>

        {s.previousResult && !s.newRecord && (
          <p className="mt-4 text-sm font-semibold text-violet-400">
            Forrige gang: {s.previousResult.score} av {s.previousResult.total}
          </p>
        )}

        {s.earnedBadges.length > 0 && (
          <div className="mt-6 w-full rounded-3xl bg-white/80 p-4">
            <p className="mb-3 font-bold text-violet-700">Nye merker! 🎖️</p>
            <div className="flex flex-wrap justify-center gap-3">
              {s.earnedBadges.map((id) => {
                const b = badgeById(id);
                if (!b) return null;
                return (
                  <div key={id} className="flex flex-col items-center animate-pop-in">
                    <span className="text-4xl">{b.emoji}</span>
                    <span className="mt-1 text-xs font-semibold text-violet-500">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            onClick={playAgain}
            className="rounded-full bg-violet-600 py-5 text-2xl font-extrabold text-white shadow-lg transition active:scale-95"
          >
            Spill igjen 🔁
          </button>
          <Link
            href="/"
            onClick={clearRoundSummary}
            className="rounded-full bg-white/70 py-4 text-lg font-bold text-violet-700 shadow-sm active:scale-95"
          >
            Hjem 🏠
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
