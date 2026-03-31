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

export type TodoStatus = "pending" | "completed";

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

export const premiumSurface = (theme:any) => ({
  borderRadius: 2,
  backdropFilter: "blur(16px)",
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`
});

export type Meal = {
  name: string;
  detail: string;
};

export type ApiResult = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  protein_goal_met: boolean;
  summary: string;
};