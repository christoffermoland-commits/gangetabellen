import { Question, Tabell, TABELLER } from "./types";

export const ROUND_LENGTH = 12;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Lager 3 plausible feilsvar nær det riktige produktet:
 * naboprodukter (faktor ±1 begge veier) og små avvik. Aldri negative,
 * aldri lik fasit, alltid unike.
 */
function buildOptions(table: number, factor: number, answer: number): number[] {
  const candidates = [
    table * (factor + 1),
    table * (factor - 1),
    (table + 1) * factor,
    (table - 1) * factor,
    answer + table,
    answer - table,
    answer + factor,
    answer - factor,
    answer + 1,
    answer - 1,
    answer + 2,
  ];

  const distractors: number[] = [];
  for (const c of shuffle(candidates)) {
    if (c > 0 && c !== answer && !distractors.includes(c)) {
      distractors.push(c);
    }
    if (distractors.length === 3) break;
  }

  // Fyll opp hvis vi mangler (skjer nesten aldri, men trygt).
  let pad = 1;
  while (distractors.length < 3) {
    const c = answer + pad;
    if (c > 0 && c !== answer && !distractors.includes(c)) distractors.push(c);
    pad = pad > 0 ? -pad : -pad + 1;
  }

  return shuffle([answer, ...distractors]);
}

function makeQuestion(table: number, factor: number): Question {
  const answer = table * factor;
  return { table, factor, answer, options: buildOptions(table, factor, answer) };
}

/**
 * Vektet trekning av tabeller. Boss-tabellen får ekstra vekt så den
 * dukker oftere opp til barnet mestrer den.
 */
function weightedTables(tables: Tabell[], boss: Tabell | null): Tabell[] {
  const pool: Tabell[] = [];
  for (const t of tables) {
    const weight = boss === t ? 3 : 1;
    for (let i = 0; i < weight; i++) pool.push(t);
  }
  return pool;
}

/** Bygger en hel runde med spørsmål, uten to like rett etter hverandre. */
export function buildRound(
  tables: Tabell[],
  boss: Tabell | null,
  count: number = ROUND_LENGTH,
): Question[] {
  const safeTables = tables.length > 0 ? tables : TABELLER;
  const pool = weightedTables(safeTables, boss);
  const questions: Question[] = [];
  let lastKey = "";

  for (let i = 0; i < count; i++) {
    let q: Question;
    let key: string;
    let attempts = 0;
    do {
      const table = pool[randInt(0, pool.length - 1)];
      const factor = randInt(1, 10);
      q = makeQuestion(table, factor);
      key = `${table}x${factor}`;
      attempts++;
    } while (key === lastKey && attempts < 10);
    lastKey = key;
    questions.push(q);
  }

  return questions;
}
