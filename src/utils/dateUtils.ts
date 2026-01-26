import dayjs from "dayjs";

/* Check if two ISO dates are same day */
export function isSameDay(a: string, b: string): boolean {
  return dayjs(a).isSame(dayjs(b), "day");
}

/* Difference in days */
export function daysBetween(a: string, b: string): number {
  return dayjs(b).diff(dayjs(a), "day");
}

/* Today ISO */
export function todayISO(): string {
  return dayjs().format("YYYY-MM-DD");
}
