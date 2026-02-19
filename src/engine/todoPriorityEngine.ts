import { Todo } from "../types/todoModels";
import { nowIST } from "../utils/istTime";

export interface TodoPriorityResult {
  urgentTodos: Todo[];
  normalTodos: Todo[];
}

/* ================= IST DAYS LEFT ================= */

const getDaysLeft = (deadline: string) => {

  const now = nowIST();
  const end = new Date(deadline + "T23:59:59+05:30");

  const diffMs = end.getTime() - now.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/* ================= PRIORITY BUILDER ================= */

export function buildTodoPriorityLists(
  todos: Todo[]
): TodoPriorityResult {

  const pending = todos.filter(t => t.status === "pending");

  const urgent: Todo[] = [];
  const normal: Todo[] = [];

  pending.forEach(todo => {

    if (!todo.deadline) {
      normal.push(todo);
      return;
    }

    const daysLeft = getDaysLeft(todo.deadline);

    /* 🔥 OVERDUE OR <=2 DAYS */
    if (daysLeft <= 2) {
      (todo as any).isOverdue = daysLeft < 0;
      urgent.push(todo);
    } else {
      normal.push(todo);
    }
  });

  const sortByDeadline = (a: Todo, b: Todo) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;

    return new Date(a.deadline + "T00:00:00+05:30").getTime() -
           new Date(b.deadline + "T00:00:00+05:30").getTime();
  };

  urgent.sort(sortByDeadline);
  normal.sort(sortByDeadline);

  return {
    urgentTodos: urgent,
    normalTodos: normal
  };
}
