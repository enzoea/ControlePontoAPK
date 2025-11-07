import dayjs from 'dayjs';

export function containsWeekend(datesISO: string[]): boolean {
  return datesISO.some(d => {
    const dow = dayjs(d).day();
    return dow === 0 || dow === 6;
  });
}