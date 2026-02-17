import { Routine } from "../types/todoModels";

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

  /* ✅ REMOVE COMPLETED TODAY */
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

    if (diffMinutes >= 0 && diffMinutes <= 180) {
      next3.push(r);
    } else {
      later.push(r);
    }
  });

  const sortByTime = (a: Routine, b: Routine) => {

    if (!a.completeByTime) return 1;
    if (!b.completeByTime) return -1;

    const ta = parseRoutineTime(a.completeByTime).getTime();
    const tb = parseRoutineTime(b.completeByTime).getTime();

    return ta - tb;
  };

  next3.sort(sortByTime);
  later.sort(sortByTime);

  return {
    next3Hours: next3,
    laterRoutines: later
  };
}
