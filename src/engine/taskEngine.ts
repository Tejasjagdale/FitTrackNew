
import { Task, TaskStatus } from "../types/todoModels";
import { daysBetween, todayISO } from "../utils/dateUtils";

export function completeTask(task: Task): Task {
  const today = todayISO();

  const completedStatus: TaskStatus = "completed";

  let next: Task = {
    ...task,
    status: completedStatus,
    lastCompleted: today
  };

  if (task.trackStreak && task.streak) {
    next = {
      ...next,
      streak: {
        current: task.streak.current + 1,
        longest: Math.max(
          task.streak.longest,
          task.streak.current + 1
        )
      }
    };
  }

  return next;
}

export function resetRepeatTasks(tasks: Task[]): Task[] {
  const today = todayISO();

  const pendingStatus: TaskStatus = "pending";

  return tasks.map(task => {
    if (task.type !== "repeat") return task;
    if (!task.lastCompleted) return task;

    const diff = daysBetween(task.lastCompleted, today);

    if (
      task.repeatEveryDays !== null &&
      diff >= task.repeatEveryDays
    ) {
      return {
        ...task,
        status: pendingStatus
      };
    }

    return task;
  });
}

export function toggleCompleteTask(task: Task): Task {
  const now = new Date().toISOString().slice(0, 10);

  /* Reopen */
  if (task.status === "completed") {
    return {
      ...task,
      status: "pending"
    };
  }

  /* Complete */
  return {
    ...task,

    status: "completed",

    lastCompleted: now,

    streak: task.trackStreak && task.streak
      ? {
          current: task.streak.current + 1,
          longest: Math.max(
            task.streak.longest,
            task.streak.current + 1
          )
        }
      : task.streak
  };
}