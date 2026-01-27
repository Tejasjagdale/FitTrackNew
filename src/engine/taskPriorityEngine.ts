import { Task } from "../types/todoModels";

/* ================= IST CORE ================= */

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function getISTNow(): Date {
  const now = new Date();

  const utc =
    now.getTime() + now.getTimezoneOffset() * 60000;

  return new Date(utc + IST_OFFSET);
}

function startOfTodayIST(): Date {
  const n = getISTNow();

  return new Date(
    n.getFullYear(),
    n.getMonth(),
    n.getDate()
  );
}

function normalize(d: Date): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );
}

/* ================= DAY DIFF ================= */

export function getDaysDiff(date: string): number {

  const today = startOfTodayIST();
  const target = normalize(new Date(date));

  return Math.floor(
    (target.getTime() - today.getTime()) / 86400000
  );
}

/* ================= REPEAT ================= */

function getNextRepeatDate(task: Task): Date {

  // Never completed = due immediately
  if (!task.lastCompleted) {
    return startOfTodayIST();
  }

  const last = normalize(new Date(task.lastCompleted));

  const interval = task.repeatEveryDays || 1;

  const next = new Date(last);

  next.setDate(next.getDate() + interval);

  return next;
}

export function getRepeatDiff(task: Task): number {

  const today = startOfTodayIST();
  const next = getNextRepeatDate(task);

  return Math.floor(
    (next.getTime() - today.getTime()) / 86400000
  );
}

/* ================= LEVEL ENGINE ================= */

/*
LEVELS (STRICT)

0 → Deadline overdue
1 → Repeat non-daily overdue / due
2 → Deadline 0–2 days
3 → Daily pending
4 → Deadline far
5 → Repeat far
*/

function getLevel(task: Task): number {

  if (task.status !== "pending") return 99;


  /* ===== DEADLINE ===== */

  if (task.type === "deadline" && task.deadline) {

    const d = getDaysDiff(task.deadline);

    // 1. Overdue
    if (d < 0) return 0;

    // 3. 0–2 days
    if (d <= 2) return 2;

    // 5. Far
    return 4;
  }


  /* ===== REPEAT ===== */

  if (task.type === "repeat") {

    const every = task.repeatEveryDays || 1;

    const diff = getRepeatDiff(task);

    // 4. Daily
    if (every === 1) return 3;

    // 2. Non-daily due / missed / new
    if (diff <= 0) return 1;

    // 6. Far
    return 5;
  }


  return 98;
}

/* ================= SORT ================= */

export function sortTasksByPriority(
  tasks: Task[]
): Task[] {

  return [...tasks].sort((a, b) => {

    const la = getLevel(a);
    const lb = getLevel(b);

    /* 1️⃣ MAIN LEVEL */
    if (la !== lb) return la - lb;


    /* 2️⃣ INSIDE LEVEL: DEADLINE SOONER FIRST */
    if (a.deadline && b.deadline) {

      const da = new Date(a.deadline).getTime();
      const db = new Date(b.deadline).getTime();

      return da - db;
    }


    /* 3️⃣ PRIORITY */
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }


    /* 4️⃣ STABLE */
    return a.title.localeCompare(b.title);
  });
}
