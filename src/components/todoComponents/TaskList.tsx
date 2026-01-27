import { Stack, Typography } from "@mui/material";

import { Task } from "../../types/todoModels";

import TaskCard from "./TaskCard";

import {
  sortTasksByPriority
} from "../../engine/taskPriorityEngine";

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

  const sorted = sortTasksByPriority(tasks);

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
