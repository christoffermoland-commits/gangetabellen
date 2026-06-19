/** Lokal datonøkkel "YYYY-MM-DD" (ikke UTC, så midnatt stemmer for brukeren). */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Datonøkkel for i går, relativt til gitt dato. */
export function yesterdayKey(d: Date = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return dateKey(y);
}

/** Datonøkkel for mandagen i uka som inneholder gitt dato (norsk uke, man–søn). */
export function startOfWeekKey(d: Date = new Date()): string {
  const m = new Date(d);
  const day = (m.getDay() + 6) % 7; // man=0 … søn=6
  m.setDate(m.getDate() - day);
  return dateKey(m);
}

/** "YYYY-MM" for måneden til gitt dato. */
export function monthKey(d: Date = new Date()): string {
  return dateKey(d).slice(0, 7);
}
