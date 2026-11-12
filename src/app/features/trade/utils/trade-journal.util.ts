/** Local date helpers intentionally use the browser's timezone, including DST boundaries. */
export function journalDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function journalDayRange(value: string): { from: string; before: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  if (journalDate(start) !== value) return null;
  const end = new Date(year, month - 1, day + 1);
  return { from: start.toISOString(), before: end.toISOString() };
}

export function moveJournalDate(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number);
  return journalDate(new Date(year, month - 1, day + days));
}
