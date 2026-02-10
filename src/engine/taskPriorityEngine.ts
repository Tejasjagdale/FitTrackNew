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

/* ================= LEVEL ENGINE - NEW PRIORITY SYSTEM ================= */

/*
STRICT PRIORITY ORDER (User Requirements):

0 → Deadline overdue (date < today) - RED, blinking
1 → Repeat non-daily overdue/due (every > 1, diff <= 0) - RED (includes lastCompleted null)
2 → Deadline due soon (0-2 days, sorted: 0→1→2)
3 → Daily repeat pending (every === 1)
4 → Deadline far (>2 days)
5 → Repeat non-daily pending (every > 1, diff > 0)
*/

function getLevel(task: Task): number {

  if (task.status !== "pending") return 99;

  /* ===== DEADLINE TASKS ===== */

  if (task.type === "deadline" && task.deadline) {

    const d = getDaysDiff(task.deadline);

    // Level 0: Deadline OVERDUE (d < 0)
    if (d < 0) return 0;

    // Level 2: Deadline due SOON (0-2 days: today, tomorrow, day after)
    if (d >= 0 && d <= 2) return 2;

    // Level 4: Deadline FAR (>2 days)
    return 4;
  }

  /* ===== REPEAT TASKS ===== */

  if (task.type === "repeat") {

    const every = task.repeatEveryDays || 1;
    const diff = getRepeatDiff(task);

    // Level 3: Daily repeat (every === 1)
    if (every === 1) return 3;

    // Level 1: Non-daily OVERDUE/DUE (diff <= 0)
    // This includes: lastCompleted null (due today) OR actually overdue (diff < 0)
    if (every > 1 && diff <= 0) return 1;

    // Level 5: Non-daily pending (every > 1, diff > 0)
    return 5;
  }

  return 98;
}

/* ================= SORT WITH NEW PRIORITY ================= */

export function sortTasksByPriority(
  tasks: Task[]
): Task[] {

  return [...tasks].sort((a, b) => {

    const la = getLevel(a);
    const lb = getLevel(b);

    /* 1️⃣ MAIN LEVEL - Strict ordering */
    if (la !== lb) return la - lb;

    /* 2️⃣ WITHIN LEVEL 0 (Overdue deadlines) - Oldest first */
    if (la === 0 && a.deadline && b.deadline) {
      const da = new Date(a.deadline).getTime();
      const db = new Date(b.deadline).getTime();
      return da - db;
    }

    /* 3️⃣ WITHIN LEVEL 1 (Overdue repeats) - By priority then name */
    if (la === 1) {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    }

    /* 4️⃣ WITHIN LEVEL 2 (Due soon) - By days (0→1→2) then priority */
    if (la === 2 && a.deadline && b.deadline) {
      const da = getDaysDiff(a.deadline);
      const db = getDaysDiff(b.deadline);
      if (da !== db) return da - db; // 0 days first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    }

    /* 5️⃣ WITHIN LEVEL 3 (Daily tasks) - By priority */
    if (la === 3) {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    }

    /* 6️⃣ WITHIN LEVEL 4 (Far deadlines) - By days then priority */
    if (la === 4 && a.deadline && b.deadline) {
      const da = getDaysDiff(a.deadline);
      const db = getDaysDiff(b.deadline);
      if (da !== db) return da - db;
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    }

    /* 7️⃣ WITHIN LEVEL 5 (Far repeats) - By priority */
    if (la === 5) {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    }

    /* 8️⃣ FALLBACK */
    return a.title.localeCompare(b.title);
  });
}
