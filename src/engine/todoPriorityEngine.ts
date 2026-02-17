import { Todo } from "../types/todoModels";

/*
  OUTPUT STRUCTURE

  urgentTodos   -> deadline <= 2 days
  normalTodos   -> rest pending todos

*/

export interface TodoPriorityResult {
  urgentTodos: Todo[];
  normalTodos: Todo[];
}

const getDaysLeft = (deadline: string) => {
  const now = new Date();
  const end = new Date(deadline + "T23:59:59");

  const diffMs = end.getTime() - now.getTime();

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export function buildTodoPriorityLists(
  todos: Todo[]
): TodoPriorityResult {

  /* ===== REMOVE COMPLETED ===== */
  const pending = todos.filter(t => t.status === "pending");

  const urgent: Todo[] = [];
  const normal: Todo[] = [];

  pending.forEach(todo => {

    if (!todo.deadline) {
      normal.push(todo);
      return;
    }

    const daysLeft = getDaysLeft(todo.deadline);

    if (daysLeft <= 2) {
      urgent.push(todo);
    } else {
      normal.push(todo);
    }
  });

  /* ===== SORT BY NEAREST DEADLINE ===== */
  const sortByDeadline = (a: Todo, b: Todo) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;

    return (
      new Date(a.deadline).getTime() -
      new Date(b.deadline).getTime()
    );
  };

  urgent.sort(sortByDeadline);
  normal.sort(sortByDeadline);

  return {
    urgentTodos: urgent,
    normalTodos: normal
  };
}
