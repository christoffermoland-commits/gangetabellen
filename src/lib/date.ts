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
