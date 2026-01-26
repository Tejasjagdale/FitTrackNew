import { Stack, Typography } from "@mui/material";

import { Task } from "../../types/todoModels";
import TaskCard from "./TaskCard";

/* ================= HELPERS ================= */

function daysUntil(date: string) {
  const d = new Date(date);
  const now = new Date();

  return Math.ceil(
    (d.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function isRepeatDueToday(task: Task) {
  if (task.type !== "repeat") return false;
  if (!task.lastCompleted) return true;

  const last = new Date(task.lastCompleted);
  const now = new Date();

  const diff =
    (now.getTime() - last.getTime()) /
    (1000 * 60 * 60 * 24);

  return diff >= (task.repeatEveryDays || 1);
}

/* ================= SORT LOGIC ================= */

function getTaskRank(task: Task): number {

  if (task.status === "on_hold") return 1000;
  /* Only pending here */
  if (task.status !== "pending") return 999;

  /* ============ DEADLINES ============ */

  if (task.type === "deadline" && task.deadline) {
    const days = daysUntil(task.deadline);

    // 0. Overdue
    if (days < 0) return 0;

    // 1. Near (0–2 days)
    if (days <= 2) return 1;

    // 5. Far
    return 5;
  }

  /* ============ REPEAT ============ */

  if (task.type === "repeat") {
    const isDaily = task.repeatEveryDays === 1;

    // 3. Daily
    if (isDaily) return 3;

    // 2. Due today
    if (isRepeatDueToday(task)) return 2;

    // 4. Not due
    return 4;
  }

  /* ============ NO DEADLINE ============ */

  return 6;
}

/* ================= COMPONENT ================= */

interface Props {
  tasks: Task[];

  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({
  tasks,
  onComplete,
  onEdit
}: Props) {
  if (!tasks.length) {
    return <Typography>No tasks</Typography>;
  }

  /* ================= SORT ================= */

  const sorted = [...tasks].sort((a, b) => {
    const ra = getTaskRank(a);
    const rb = getTaskRank(b);

    if (ra !== rb) return ra - rb;

    /* Same rank → secondary sort */

    // Earlier deadlines first
    if (a.deadline && b.deadline) {
      return (
        new Date(a.deadline).getTime() -
        new Date(b.deadline).getTime()
      );
    }

    // Higher priority first
    return b.priority - a.priority;
  });

  /* ================= RENDER ================= */

  return (
    <Stack spacing={1.5}>
      {sorted.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={() => onComplete(task)}
          onEdit={() => onEdit(task)}
        />
      ))}
    </Stack>
  );
}
