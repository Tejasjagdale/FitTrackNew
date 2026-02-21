import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Modal,
  Paper,
  Divider
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useMemo, useState } from "react";
import { Todo, Priority, Group } from "../../types/todoModels";
import { nowIST, todayISTString } from "../../utils/istTime";
import { motion } from "framer-motion";

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

function formatGroup(id: string) {
  return id.replace(/^grp_/, "");
}

/* =========================================================
   PREMIUM CALENDAR
========================================================= */

export default function TodoMonthCalendar({ todos, groups }: { todos: Todo[], groups: Group[]; }) {

  const now = nowIST();

  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth()
  });

  const [openDay, setOpenDay] = useState<any | null>(null);

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
      p: 1.4,
      borderRadius: 3,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(24px)"
    }}>

      {/* ================= HEADER (PREMIUM STYLE) ================= */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography
          fontWeight={700}
          fontSize={13}
          sx={{
            letterSpacing: 1,
            textTransform: "uppercase",
            opacity: .9
          }}
        >
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* WEEKDAY */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7,minmax(0,1fr))",
        gap: "6px"
      }}>
        {weekday.map(w => (
          <Typography key={w} sx={{ fontSize: 10, opacity: .5, textAlign: "center" }}>
            {w}
          </Typography>
        ))}
      </Box>

      {/* ================= GRID ================= */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7,minmax(0,1fr))",
        gap: "6px"
      }}>
        {cells.map((c, i) => {

          if (!c.day) {
            return <Box key={i} sx={{ height: 86 }} />;
          }

          const dense = c.todos.length > 3;
          const visibleCount = dense ? 2 : 3;
          const overdueHeat = Math.min(c.overdueCount * .12, .35);

          return (
            <motion.div key={i} whileTap={{ scale: .96 }}>
              <Box
                onClick={() => setOpenDay(c)}
                sx={{
                  position: "relative",
                  minHeight: 86,
                  borderRadius: 2,
                  p: .7,
                  cursor: "pointer",
                  transition: "all .15s ease",
                  background: `
                    linear-gradient(180deg,rgba(0,0,0,0.32),rgba(0,0,0,0.2)),
                    radial-gradient(circle at top,
                    rgba(255,70,70,${overdueHeat}),transparent 70%)
                  `,
                  "&:active": { filter: "brightness(1.2)" },
                  border: c.isToday
                    ? "1px solid rgba(0,255,166,.6)"
                    : "1px solid rgba(255,255,255,0.05)"
                }}
              >

                {/* TODAY DOT */}
                {c.isToday && (
                  <Box sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#00ffa6"
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
                      ? "linear-gradient(135deg, rgba(0,255,166,.35), rgba(0,255,166,.15))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",

                    color:
                      c.overdueCount > 0
                        ? "#ff6b6b"
                        : c.todos.length
                          ? "#e6fff7"
                          : "rgba(255,255,255,.65)",

                    border: c.isToday
                      ? "1px solid rgba(0,255,166,.7)"
                      : "1px solid rgba(255,255,255,.08)",

                    boxShadow: c.isToday
                      ? "0 0 12px rgba(0,255,166,.55)"
                      : c.overdueCount > 0
                        ? "0 0 10px rgba(255,80,80,.35)"
                        : "none",

                    transition: "all .18s ease"
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
                          background: priority.bg,
                          backdropFilter: "blur(4px)"
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

      {/* ================= PREMIUM BOTTOM SHEET MODAL ================= */}
      <Modal open={!!openDay} onClose={() => setOpenDay(null)}>
        <Box sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          outline: "none"
        }}>
          {openDay && (
            <Paper sx={{
              p: 1.6,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              background:
                "linear-gradient(180deg, rgba(0,255,170,0.10), rgba(0,0,0,0.7))",
              borderTop: "1px solid rgba(255,255,255,0.08)"
            }}>

              <Box sx={{
                width: 40,
                height: 4,
                borderRadius: 10,
                background: "rgba(255,255,255,.2)",
                mx: "auto",
                mb: 1
              }} />

              <Typography fontWeight={700} fontSize={13}>
                Task's on 📅 {openDay.dateStr}
              </Typography>

              <Divider sx={{ my: 1, opacity: .2 }} />

              <Box
                sx={{
                  height: 350,
                  overflowY: "auto",
                  pr: .4,
                  "&::-webkit-scrollbar": { width: 5 },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255,255,255,.25)",
                    borderRadius: 8,
                  },
                }}
              >
                {openDay.todos.length === 0 ? (

                  <Box sx={{
                    textAlign: "center",
                    py: 6,
                    opacity: .75,
                    animation: "fadeIn .35s ease",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(8px)" },
                      to: { opacity: 1, transform: "translateY(0)" }
                    }
                  }}>
                    <Typography fontSize={34}>😌</Typography>
                    <Typography fontSize={12}>
                      No tasks scheduled
                    </Typography>
                  </Box>

                ) : (

                  openDay.todos.map((t: Todo) => {

                    const status = getStatusChip(t);

                    return (
                      <Paper key={t.id} sx={{
                        p: .9,
                        borderRadius: 1,
                        background: "rgba(255,255,255,0.04)",
                        border: status.label === "Overdue"
                          ? "1px solid rgba(255,80,80,.5)"
                          : "1px solid rgba(255,255,255,0.06)",
                        mb: .6
                      }}>
                        <Typography fontSize={12}>
                          {t.title}
                        </Typography>

                        <Stack direction="row" spacing={0.4} mt={0.5} flexWrap="wrap">

                          <Chip
                            size="small"
                            variant="outlined"
                            label={status.label}
                            sx={{
                              border: `1px solid ${status.bg}`,
                              color: status.bg,
                              height: 18,
                              fontSize: 10,
                            }}
                          />

                          {t.groupIds?.map((g: string) => (
                            <Chip
                              key={g}
                              size="small"
                              label={groupMap[g] ?? "deleted group"}
                              variant="filled"
                              color={groupMap[g] ? "primary" : "error"}
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          ))}

                        </Stack>
                      </Paper>
                    )
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