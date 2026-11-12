import { journalDate, journalDayRange, moveJournalDate } from './trade-journal.util';

describe('Local journal dates', () => {
  it('uses local midnight and an exclusive next-day boundary', () => {
    expect(journalDayRange('2026-11-12')).toEqual({
      from: new Date(2026, 10, 12).toISOString(),
      before: new Date(2026, 10, 13).toISOString(),
    });
  });
  it('rejects invalid calendar dates and empty values', () => {
    for (const value of ['', '2026-02-30', '2026-13-01', '2026-1-1'])
      expect(journalDayRange(value)).toBeNull();
  });
  it('moves across month/year and leap-day boundaries', () => {
    expect(moveJournalDate('2026-01-01', -1)).toBe('2025-12-31');
    expect(moveJournalDate('2024-02-28', 1)).toBe('2024-02-29');
    expect(journalDate(new Date(2026, 10, 12, 23, 59))).toBe('2026-11-12');
  });
});
