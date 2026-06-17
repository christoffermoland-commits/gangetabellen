"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { buildRound } from "@/lib/questions";
import { bossTable } from "@/lib/mastery";
import { Question } from "@/lib/types";
import { PageShell } from "@/components/ui";

const SURPRISES = [
  "🎉 Du er on fire!",
  "🚀 Helt rå!",
  "🌈 Magisk!",
  "⚡️ Lynrask!",
  "🦄 Fantastisk!",
];

type Phase = "answering" | "feedback";

export default function OvelsePage() {
  const { state, hydrated, finishRound } = useStore();
  const router = useRouter();

  // Bygg runden én gang, når store er hydrert.
  const [round, setRound] = useState<Question[] | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (state.selectedTables.length === 0) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRound(
      buildRound(
        state.selectedTables,
        bossTable((state.hardMode ? state.hard : state.normal).progress),
      ),
    );
    // Bevisst kun ved hydrering – vi vil ikke bygge runden på nytt underveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || !round) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center text-violet-400">
          Gjør klar spørsmål …
        </div>
      </PageShell>
    );
  }

  return (
    <Game
      round={round}
      hardMode={state.hardMode}
      onFinish={finishRound}
      onDone={() => router.replace("/resultat")}
    />
  );
}

function Game({
  round,
  hardMode,
  onFinish,
  onDone,
}: {
  round: Question[];
  hardMode: boolean;
  onFinish: ReturnType<typeof useStore>["finishRound"];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [picked, setPicked] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [surprise, setSurprise] = useState<string | null>(null);
  const [showStar, setShowStar] = useState(false);

  // Per-tabell-telling akkumuleres i en ref og committes ved rundens slutt.
  const perTable = useRef<Record<number, { spurt: number; riktig: number }>>({});
  const finished = useRef(false);
  const surpriseIdx = useRef(0);

  const q = round[index];
  const progress = ((index + (phase === "feedback" ? 1 : 0)) / round.length) * 100;

  const submit = (value: number) => {
    if (phase !== "answering") return;
    const correct = value === q.answer;
    setPicked(value);
    setPhase("feedback");

    const pt = perTable.current[q.table] ?? { spurt: 0, riktig: 0 };
    pt.spurt += 1;
    if (correct) pt.riktig += 1;
    perTable.current[q.table] = pt;

    // Beregn ferske verdier lokalt så de er trygt tilgjengelige i timeouten.
    const newStreak = correct ? streak + 1 : 0;
    const newScore = correct ? score + 1 : score;
    const newBest = Math.max(bestStreak, newStreak);

    if (correct) {
      setStreak(newStreak);
      setBestStreak(newBest);
      setScore(newScore);
      setShowStar(true);
      if (newStreak % 10 === 0) {
        setSurprise(SURPRISES[surpriseIdx.current % SURPRISES.length]);
        surpriseIdx.current += 1;
      }
    } else {
      setStreak(0);
    }

    const isLast = index + 1 >= round.length;
    const delay = correct ? 800 : 1100;
    setTimeout(() => {
      if (isLast) {
        if (finished.current) return;
        finished.current = true;
        onFinish({
          score: newScore,
          total: round.length,
          bestStreakThisRound: newBest,
          perTable: perTable.current,
        });
        onDone();
        return;
      }
      setShowStar(false);
      setSurprise(null);
      setPicked(null);
      setEntry("");
      setPhase("answering");
      setIndex((i) => i + 1);
    }, delay);
  };

  // Tallpanel (Hard Mode)
  const pressDigit = (d: string) => {
    if (phase !== "answering") return;
    setEntry((e) => (e.length >= 3 ? e : e + d));
  };
  const pressDelete = () => {
    if (phase !== "answering") return;
    setEntry((e) => e.slice(0, -1));
  };
  const pressOk = () => {
    if (phase !== "answering" || entry === "") return;
    submit(Number(entry));
  };

  return (
    <PageShell>
      {/* Topplinje: fremdrift + streak */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-orange-500">
          🔥 {streak}
        </div>
      </div>

      <p className="mb-2 text-center text-sm font-semibold text-violet-400">
        Spørsmål {index + 1} av {round.length}
      </p>

      {/* Spørsmål */}
      <div className="relative mb-8 flex flex-col items-center justify-center rounded-[2rem] bg-white/85 py-12 shadow-sm">
        <div className="text-6xl font-extrabold text-violet-700">
          {q.table} × {q.factor}
        </div>
        {hardMode ? (
          <div
            className={`mt-2 text-5xl font-extrabold ${
              phase === "feedback"
                ? picked === q.answer
                  ? "text-emerald-500"
                  : "text-rose-400 animate-shake"
                : "text-violet-300"
            }`}
          >
            = {phase === "answering" ? entry || "?" : picked}
          </div>
        ) : (
          <div className="mt-2 text-5xl font-extrabold text-violet-300">= ?</div>
        )}
        {hardMode && phase === "feedback" && picked !== q.answer && (
          <div className="mt-1 text-lg font-bold text-emerald-600">Riktig svar: {q.answer}</div>
        )}

        {showStar && (
          <div className="pointer-events-none absolute right-6 top-6 text-4xl animate-float-up">
            ⭐
          </div>
        )}
        {surprise && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[2rem] bg-violet-600/90 text-3xl font-extrabold text-white animate-pop-in">
            {surprise}
          </div>
        )}
      </div>

      {hardMode ? (
        /* Tallpanel */
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              disabled={phase === "feedback"}
              className="rounded-2xl bg-white py-6 text-3xl font-extrabold text-violet-700 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          <button
            onClick={pressDelete}
            disabled={phase === "feedback"}
            aria-label="Slett siste siffer"
            className="rounded-2xl bg-white/70 py-6 text-3xl font-extrabold text-violet-500 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            ⌫
          </button>
          <button
            onClick={() => pressDigit("0")}
            disabled={phase === "feedback"}
            className="rounded-2xl bg-white py-6 text-3xl font-extrabold text-violet-700 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={pressOk}
            disabled={phase === "feedback" || entry === ""}
            aria-label="Svar"
            className="rounded-2xl bg-violet-600 py-6 text-2xl font-extrabold text-white shadow-sm transition active:scale-95 disabled:opacity-40"
          >
            OK
          </button>
        </div>
      ) : (
        /* Svaralternativer */
        <div className="grid grid-cols-2 gap-4">
          {q.options.map((opt) => {
            const isCorrect = opt === q.answer;
            const isPicked = opt === picked;
            let style = "bg-white text-violet-700 active:scale-95";
            if (phase === "feedback") {
              if (isCorrect) style = "bg-emerald-500 text-white scale-105";
              else if (isPicked) style = "bg-rose-400 text-white animate-shake";
              else style = "bg-white/60 text-violet-300";
            }
            return (
              <button
                key={opt}
                onClick={() => submit(opt)}
                disabled={phase === "feedback"}
                className={`rounded-3xl py-8 text-4xl font-extrabold shadow-sm transition ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
