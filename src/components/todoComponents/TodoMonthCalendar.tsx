import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Modal,
  Paper,
  Divider,
  useTheme
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useEffect, useMemo, useState } from "react";
import { Todo, Priority, Group } from "../../types/todoModels";
import { nowIST, todayISTString } from "../../utils/istTime";
import { motion } from "framer-motion";
import CheckIcon from "@mui/icons-material/Checklist";
import PremiumTaskCard from "./PremiumTaskCard";
import AddIcon from "@mui/icons-material/Add";

/* =========================================================
   CALENDAR BUILD (UNCHANGED LOGIC)
========================================================= */

function buildCalendar(todos: Todo[], year: number, month: number) {

  const todayStr = todayISTString();

  const firstDay = new Date(
    `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00+05:30`
  );

  const startWeekday = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: any[] = [];

  for (let i = 0; i < startWeekday; i++) cells.push({});

  for (let d = 1; d <= totalDays; d++) {

    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const dayTodos = todos.filter(t => t.deadline === dateStr);

    const overdueCount = dayTodos.filter(
      t => t.status !== "completed" && t.deadline && t.deadline < todayStr
    ).length;

    cells.push({
      day: d,
      dateStr,
      todos: dayTodos,
      isToday: dateStr === todayStr,
      overdueCount
    });
  }

  while (cells.length % 7 !== 0) cells.push({});

  return cells;
}

/* ========================================================= */

function getStatusChip(todo: Todo) {

  if (todo.status === "completed")
    return { label: "Completed", bg: "#00ffa6", color: "#002d22" };

  if (todo.deadline && todo.deadline < todayISTString())
    return { label: "Overdue", bg: "#ff4d4d", color: "#2b0000" };

  return { label: "Pending", bg: "#ffaa00", color: "#2c1600" };
}

function getPriorityChip(priority: Priority) {

  if (priority === "high")
    return { bg: "rgba(255,80,80,.30)" };

  if (priority === "medium")
    return { bg: "rgba(255,170,0,.28)" };

  return { bg: "rgba(60,170,255,.26)" };
}

/* =========================================================
   PREMIUM CALENDAR
========================================================= */

export default function TodoMonthCalendar({
  todos,
  groups,
  onToggleTodo,
  onEditTodo,
  onAddTodo
}: {
  todos: Todo[];
  groups: Group[];
  onToggleTodo: (t: Todo) => void;
  onEditTodo: (t: Todo) => void;
  onAddTodo: () => void;
}) {

  const now = nowIST();
  const theme = useTheme();

  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth()
  });

  const [openDay, setOpenDay] = useState<any | null>(null);

  useEffect(() => {
    if (!openDay) return;

    const updated = cells.find(c => c.dateStr === openDay.dateStr);
    if (updated) setOpenDay(updated);

  }, [todos]);

  const groupMap = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach(g => {
      map[g.id] = g.name;
    });
    return map;
  }, [groups]);

  const cells = useMemo(
    () => buildCalendar(todos, cursor.year, cursor.month),
    [todos, cursor]
  );

  const monthLabel = useMemo(() => {
    return new Date(cursor.year, cursor.month).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }, [cursor]);

  const weekday = ["S", "M", "T", "W", "T", "F", "S"];

  const goPrev = () => {
    setCursor(p => {
      const m = p.month - 1;
      if (m < 0) return { year: p.year - 1, month: 11 };
      return { year: p.year, month: m };
    });
  };

  const goNext = () => {
    setCursor(p => {
      const m = p.month + 1;
      if (m > 11) return { year: p.year + 1, month: 0 };
      return { year: p.year, month: m };
    });
  };

  return (
    <Stack spacing={1.2} sx={{
      p: { xs: 1, sm: 1.4 },
      borderRadius: 2,
      background: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: "blur(24px)"
    }}>

      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <CheckIcon sx={{ opacity: .8, color: "text.primary" }} />
        <Typography
          fontWeight={700}
          fontSize={{ xs: 18, sm: 22 }}
          color="text.primary"
        >
          Todo Tasks Calender
        </Typography>
      </Stack>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography
          fontWeight={700}
          fontSize={{ xs: 12, sm: 13 }}
          sx={{ letterSpacing: 1, textTransform: "uppercase", opacity: .9 }}
          color="text.primary"
        >
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* WEEKDAY */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "6px" }}>
        {weekday.map(w => (
          <Typography key={w} color="text.primary" sx={{ fontSize: 10, opacity: .6, textAlign: "center" }}>
            {w}
          </Typography>
        ))}
      </Box>

      {/* CALENDAR GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,minmax(0,1fr))",
          gap: 0,
          borderRadius: 1,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          // background: theme.palette.background.paper
        }}
      >
        {cells.map((c, i) => {

          if (!c.day) {
            return <Box key={i} sx={{ height: { xs: 64, sm: 86 } }} />;
          }

          const dense = c.todos.length > 3;
          const visibleCount = dense ? 2 : 3;
          const completedCount = c.todos.filter(
            (t: Todo) => t.status === "completed"
          ).length;

          const pendingCount = c.todos.filter(
            (t: Todo) => t.status !== "completed" && t.deadline && t.deadline >= todayISTString()
          ).length;

          const overdueCount = c.todos.filter(
            (t: Todo) => t.status !== "completed" && t.deadline && t.deadline < todayISTString()
          ).length;

          let dayColor = theme.palette.primary.main;

          if (overdueCount > 0) {
            dayColor = theme.palette.error.main;
          } else if (pendingCount > 0) {
            dayColor = theme.palette.primary.main;
          } else if (completedCount > 0) {
            dayColor = theme.palette.success.main;
          }
          return (
            <motion.div key={i} whileTap={{ scale: .96 }}>
              <Box
                onClick={() => setOpenDay(c)}
                sx={{
                  position: "relative",
                  minHeight: { xs: 64, sm: 86 },
                  p: .7,
                  cursor: "pointer",

                  borderRight: (i + 1) % 7 !== 0
                    ? `1px solid ${theme.palette.divider}`
                    : "none",

                  borderBottom:
                    i < cells.length - 7
                      ? `1px solid ${theme.palette.divider}`
                      : "none",

                  background: theme.palette.background.paper,
                }}
              >

                {c.isToday && (
                  <Box sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: theme.palette.primary.main
                  }} />
                )}

                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    backdropFilter: "blur(10px)",

                    background: c.isToday
                      ? theme.palette.primary.main
                      : c.todos.length
                        ? `${theme.palette.primary.main}22`
                        : `${theme.palette.background.paper}`,

                    color: c.isToday
                      ? theme.palette.getContrastText(theme.palette.primary.main)
                      : theme.palette.text.primary,

                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {c.day}
                </Box>

                <Stack spacing={0.25} mt={0.4}>
                  {c.todos.slice(0, visibleCount).map((t: Todo) => {

                    const priority = getPriorityChip(t.priority);

                    return (
                      <Chip
                        key={t.id}
                        label={t.title}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,

                          background:
                            t.status === "completed"
                              ? `${theme.palette.success.main}22`
                              : t.deadline && t.deadline < todayISTString()
                                ? `${theme.palette.error.main}22`
                                : `${theme.palette.primary.main}22`,

                          color:
                            t.status === "completed"
                              ? theme.palette.success.main
                              : t.deadline && t.deadline < todayISTString()
                                ? theme.palette.error.main
                                : theme.palette.primary.main,

                          border: `1px solid ${t.status === "completed"
                            ? theme.palette.success.main
                            : t.deadline && t.deadline < todayISTString()
                              ? theme.palette.error.main
                              : theme.palette.primary.main
                            }33`
                        }}
                      />
                    )
                  })}
                  {c.todos.length > visibleCount && (
                    <Typography fontSize={10} sx={{ opacity: .6 }}>
                      +{c.todos.length - visibleCount}
                    </Typography>
                  )}
                </Stack>

              </Box>
            </motion.div>
          )
        })}
      </Box>

      {/* MODAL */}
      <Modal open={!!openDay} onClose={() => setOpenDay(null)}>
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          {openDay && (
            <Paper sx={{
              p: 1.6,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              background: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`
            }}>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={700} fontSize={13}>
                  Tasks on 📅 {openDay.dateStr}
                </Typography>

                <IconButton
                  size="small"
                  onClick={onAddTodo}
                  sx={{
                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,
                    width: 28,
                    height: 28
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 1, opacity: .2 }} />

              <Box sx={{ height: { xs: 300, sm: 350 }, overflowY: "auto", pr: .4 }}>
                {openDay.todos.length === 0 ? (

                  <Box sx={{
                    textAlign: "center",
                    py: 6,
                    opacity: .75
                  }}>
                    <Typography fontSize={34}>😌</Typography>
                    <Typography fontSize={12}>
                      No tasks scheduled
                    </Typography>
                  </Box>

                ) : (
                  openDay.todos.map((t: Todo) => {

                    const isDone = t.status === "completed";
                    return (
                      <Box key={t.id} mb={1.5}>
                        <PremiumTaskCard
                          title={t.title}
                          done={isDone}
                          meta={isDone ? "Done" : t.deadline ?? undefined}
                          groups={groups}
                          groupIds={t.groupIds}
                          isOverdue={Boolean(!isDone && t.deadline && t.deadline < todayISTString())}
                          onToggle={() => onToggleTodo(t)}
                          onEdit={() => onEditTodo(t)}
                          routine={null}
                          variant="calendar"
                        />
                      </Box>

                    );
                  })
                )}
              </Box>

            </Paper>
          )}
        </Box>
      </Modal>

    </Stack>
  );
}