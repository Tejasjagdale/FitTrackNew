export interface Group {
  id: string;
  name: string;
}

export type Priority = "low" | "medium" | "high";

export interface Streak {
  current: number;
  longest: number;
}

/* ================= ROUTINE ================= */

export interface Routine {
  id: string;
  title: string;
  priority: Priority;
  groupIds: string[];

  repeatEveryDays: number;

  completeByTime?: string | null;

  trackStreak: boolean;
  streak: Streak | null;

  completedToday?: string | null;

  /* ✅ NEW */
  history?: string[];
}

/* ================= TODO ================= */

export type TodoStatus =
  | "pending"
  | "completed";

export interface Todo {
  id: string;
  title: string;
  priority: Priority;
  groupIds: string[];

  deadline: string | null;

  createdAt: string;

  completedAt: string | null;

  status: TodoStatus;
}

/* ================= ROOT ================= */

export interface TodoDatabase {
  groups: Group[];
  routines: Routine[];
  todos: Todo[];
}

export const premiumSurface = {
  background:
    "linear-gradient(180deg, rgba(0,255,170,0.06), rgba(0,255,170,0.015))",
  border: "1px solid rgba(0,255,170,0.18)",
  backdropFilter: "blur(18px)",
};
