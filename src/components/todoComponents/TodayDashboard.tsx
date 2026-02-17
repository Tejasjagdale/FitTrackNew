import {
  Stack,
  Paper,
  Typography,
  Checkbox,
  Box,
  Chip
} from "@mui/material";

import { Routine, Todo } from "../../types/todoModels";

interface Props {
  routines: Routine[];
  todos: Todo[];
  onToggleRoutine: (r: Routine) => void;
  onToggleTodo: (t: Todo) => void;
}

export default function TodayDashboard({
  routines,
  todos,
  onToggleRoutine,
  onToggleTodo
}: Props) {

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  /* ================= TIME HELPERS ================= */

  const routineTimeLeft = (r: Routine) => {
    if (!r.completeByTime) return Infinity;

    const [h, m] = r.completeByTime.split(":").map(Number);

    const target = new Date();
    target.setHours(h, m, 0, 0);

    return target.getTime() - now.getTime();
  };

  const todoTimeLeft = (t: Todo) => {
    if (!t.deadline) return Infinity;
    return new Date(t.deadline).getTime() - now.getTime();
  };

  /* ================= LANDING FILTER ================= */

  const urgentRoutines = routines
    .filter(r => {
      const diff = routineTimeLeft(r);
      return diff > 0 && diff <= 3 * 60 * 60 * 1000;
    })
    .sort((a, b) => routineTimeLeft(a) - routineTimeLeft(b));

  const priorityTodos = todos
    .filter(t => t.priority === "high" && t.status === "pending")
    .sort((a, b) => todoTimeLeft(a) - todoTimeLeft(b));

  /* ================= PREMIUM CARD ================= */

  const Card = (
    item: any,
    mode: "routine" | "todo"
  ) => {

    const urgent =
      mode === "routine"
        ? routineTimeLeft(item) <= 30 * 60 * 1000
        : todoTimeLeft(item) <= 0;

    const done =
      mode === "routine"
        ? item.completedToday === todayStr
        : item.status === "completed";

    return (
      <Paper
        key={item.id}
        elevation={0}
        sx={{
          px: 2,
          py: 1.6,
          borderRadius: 2,
          background: "#111",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          transition: "all .18s ease",
          "&:active": {
            transform: "scale(.98)"
          }
        }}
      >
        {/* URGENCY STRIPE */}

        {urgent && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: "#ff3b30"
            }}
          />
        )}

        <Stack direction="row" spacing={1.2} alignItems="center">

          <Checkbox
            checked={done}
            onChange={() =>
              mode === "routine"
                ? onToggleRoutine(item)
                : onToggleTodo(item)
            }
            sx={{
              p: 0.4
            }}
          />

          <Box sx={{ flex: 1 }}>

            <Typography
              sx={{
                fontSize: ".95rem",
                fontWeight: 600,
                opacity: done ? 0.5 : 1
              }}
            >
              {item.title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              mt={0.4}
              alignItems="center"
            >
              {mode === "routine" && item.completeByTime && (
                <Chip
                  size="small"
                  label={`By ${item.completeByTime}`}
                  sx={{
                    height: 20,
                    fontSize: ".65rem",
                    background: "rgba(255,255,255,0.08)"
                  }}
                />
              )}

              {mode === "todo" && item.deadline && (
                <Chip
                  size="small"
                  label={item.deadline}
                  sx={{
                    height: 20,
                    fontSize: ".65rem",
                    background: "rgba(255,255,255,0.08)"
                  }}
                />
              )}
            </Stack>

          </Box>

        </Stack>

      </Paper>
    );
  };

  /* ================= RENDER ================= */

  return (
    <Stack spacing={1.4}>

      {priorityTodos.length > 0 && (
        <>
          <Typography
            sx={{
              fontSize: ".75rem",
              fontWeight: 700,
              opacity: .6,
              letterSpacing: 1
            }}
          >
            PRIORITY
          </Typography>
          {priorityTodos.map(t => Card(t, "todo"))}
        </>
      )}

      {urgentRoutines.length > 0 && (
        <>
          <Typography
            sx={{
              fontSize: ".75rem",
              fontWeight: 700,
              opacity: .6,
              letterSpacing: 1
            }}
          >
            NEXT 3 HOURS
          </Typography>
          {urgentRoutines.map(r => Card(r, "routine"))}
        </>
      )}

    </Stack>
  );
}
