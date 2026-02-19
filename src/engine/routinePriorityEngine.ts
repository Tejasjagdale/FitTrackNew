import { Routine, Streak } from "../types/todoModels";

export interface RoutinePriorityResult {
  next3Hours: Routine[];
  laterRoutines: Routine[];
}

const parseRoutineTime = (timeStr: string) => {

  const [time, mer] = timeStr.split(" ");

  let [h, m] = time.split(":").map(Number);

  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;

  const d = new Date();
  d.setHours(h, m, 0, 0);

  return d;
};

export function buildRoutinePriorityLists(
  routines: Routine[]
): RoutinePriorityResult {

  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const pending = routines.filter(
    r => r.completedToday !== todayStr
  );

  const next3: Routine[] = [];
  const later: Routine[] = [];

  pending.forEach(r => {

    if (!r.completeByTime) {
      later.push(r);
      return;
    }

    const routineDate = parseRoutineTime(r.completeByTime);

    const diffMinutes =
      (routineDate.getTime() - now.getTime()) / 60000;

    /* 🔥 URGENT = 15 MIN */
    (r as any).isUrgent = diffMinutes >= 0 && diffMinutes <= 15;

    if (diffMinutes >= 0 && diffMinutes <= 180) {
      next3.push(r);
    } else {
      later.push(r);
    }
  });

  const sortByTime = (a: Routine, b: Routine) => {
    const ta = parseRoutineTime(a.completeByTime!).getTime();
    const tb = parseRoutineTime(b.completeByTime!).getTime();
    return ta - tb;
  };

  next3.sort(sortByTime);
  later.sort(sortByTime);

  return {
    next3Hours: next3,
    laterRoutines: later
  };
}

export function recalcStreak(history: { date: string }[]): Streak {

  if (!history.length) {
    return { current: 0, longest: 0 };
  }

  const dates = history
    .map(h => new Date(h.date))
    .sort((a, b) => a.getTime() - b.getTime());

  let current = 1;
  let longest = 1;
  let temp = 1;

  for (let i = 1; i < dates.length; i++) {

    const prev = dates[i - 1];
    const cur = dates[i];

    const diff =
      (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      temp++;
    } else if (diff > 1) {
      temp = 1;
    }

    longest = Math.max(longest, temp);
  }

  const today = new Date().toISOString().slice(0,10);
  const last = history[history.length - 1].date;

  current = last === today ? temp : 0;

  return { current, longest };
}