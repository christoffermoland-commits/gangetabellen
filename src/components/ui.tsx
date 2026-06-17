import Link from "next/link";
import { Tabell } from "@/lib/types";

/** Fast farge per tabell, brukt konsekvent på tvers av skjermene. */
export const TABLE_COLORS: Record<Tabell, { bg: string }> = {
  1: { bg: "bg-rose-400" },
  2: { bg: "bg-amber-400" },
  3: { bg: "bg-emerald-400" },
  4: { bg: "bg-sky-400" },
  5: { bg: "bg-violet-400" },
  6: { bg: "bg-orange-400" },
  7: { bg: "bg-lime-500" },
  8: { bg: "bg-cyan-400" },
  9: { bg: "bg-fuchsia-400" },
  10: { bg: "bg-indigo-400" },
};

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-6">
      {children}
    </main>
  );
}

export function BackLink({ href = "/", label = "Hjem" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 self-start rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm active:scale-95"
    >
      ← {label}
    </Link>
  );
}
