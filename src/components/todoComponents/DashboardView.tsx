import {
  Paper,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";

import { Group, Routine, Todo } from "../../types/todoModels";
import RoutineHeatmap from "./RoutineHeatmap";
import TodoMonthCalendar from "./TodoMonthCalendar";
import { useEffect, useState } from "react";


type Props = {
  routines: Routine[];
  todos: Todo[];   // ✅ add this
  groups: Group[];
  onToggleTodo: (t: Todo) => void;
  onEditTodo: (t: Todo) => void;
  onAddTodo: () => void;
};

export default function DashboardView({
  routines,
  todos,
  groups,
  onToggleTodo,
  onEditTodo,
  onAddTodo }: Props) {
  const theme = useTheme();

  /* ======================================================
     UI
  ====================================================== */

  return (
    <Stack spacing={{ xs: 2, sm: 3 }}>
      <Paper
        sx={{
          p: { xs: 1.2, sm: 1.5 },
          borderRadius: 2,
          position: "relative",

          background: `
    linear-gradient(
      160deg,
      ${theme.palette.background.paper},
      ${theme.palette.background.paper}dd
    )
  `,

          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(14px)",

          transition: "all .25s ease",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.45)"
                : "0 6px 16px rgba(0,0,0,0.08)"
          }
        }}
      >
        {/* HEADER */}
        <Stack direction="row" spacing={1} mb={2} alignItems="center">
          <InsightsIcon sx={{ opacity: .8 }} />
          <Typography fontWeight={700} variant="h5">
            Routine Intelligence
          </Typography>
        </Stack>

        {/* GLOBAL HEATMAP */}
        <RoutineHeatmap routines={routines} />

      </Paper>




      <TodoMonthCalendar
        todos={todos}
        groups={groups}
        onToggleTodo={onToggleTodo}
        onEditTodo={onEditTodo}
        onAddTodo={onAddTodo}
      />

    </Stack>
  );
}
