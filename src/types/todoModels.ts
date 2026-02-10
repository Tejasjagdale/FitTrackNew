/* ================= GROUP ================= */

export interface Group {
  id: string;
  name: string;
}

/* ================= STREAK ================= */

export interface Streak {
  current: number;
  longest: number;
}

/* ================= TASK ================= */

export type TaskType = "repeat" | "deadline";
export type TaskStatus =
  | "pending"
  | "completed"
  | "on_hold";

export interface Task {
  createdAt: any;
  id: string;

  title: string;
  priority: number; // 1–5

  groupIds: string[];

  type: TaskType;

  deadline: string | null;

  repeatEveryDays: number | null;

  trackStreak: boolean;

  streak: Streak | null;

  lastCompleted: string | null;

  status: TaskStatus;
}

/* ================= ROOT ================= */

export interface TodoDatabase {
  groups: Group[];
  tasks: Task[];
}
