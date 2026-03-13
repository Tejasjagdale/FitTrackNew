import {
  Box,
  Stack,
  Typography,
  IconButton
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useState } from "react";
import { Routine } from "../../types/todoModels";
import { formatDateIST } from "../../utils/dateUtils";


function getStreakRanges(history: string[]) {

  const sorted = [...history].sort();

  if (!sorted.length) {
    return { current: [], longest: [] };
  }

  const toDate = (s: string) => new Date(s + "T00:00:00");

  let longest: string[] = [];
  let current: string[] = [];

  let run: string[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {

    const prev = toDate(sorted[i - 1]);
    const curr = toDate(sorted[i]);

    const diff =
      (curr.getTime() - prev.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      run.push(sorted[i]);
    } else {
      if (run.length > longest.length) longest = run;
      run = [sorted[i]];
    }
  }

  if (run.length > longest.length) longest = run;

  const todayStr = formatDateIST(new Date());

  const last = sorted[sorted.length - 1];

  if (last === todayStr) {
    current = run;
  }

  return { current, longest };
}

/* ===========================================
   BUILD MONTH GRID
=========================================== */

function buildMonthMatrix(
  routine: Routine,
  year: number,
  month: number
) {

  const history = routine.history ?? [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: {
    day?: number;
    done?: boolean;
    future?: boolean;
    dateStr?: string;
  }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({});
  }

  for (let d = 1; d <= totalDays; d++) {

    const dateObj = new Date(year, month, d);
    const dateStr = formatDateIST(dateObj);

    const isFuture =
      dateObj.getTime() >
      new Date().setHours(0, 0, 0, 0);

    cells.push({
      day: d,
      done: history.includes(dateStr),
      future: isFuture,
      dateStr
    });
  }

  return cells;
}

/* ===========================================
   COMPONENT
=========================================== */

export default function RoutineMonthCalendar({
  routine,
  onToggleDate
}: {
  routine: Routine;
  onToggleDate?: (date: string) => void;
}) {
  const { current, longest } = getStreakRanges(routine.history ?? []);
  const today = new Date();

  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth()
  });

  const cells = buildMonthMatrix(
    routine,
    cursor.year,
    cursor.month
  );

  const monthLabel = new Date(
    cursor.year,
    cursor.month
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  const weekday = ["S", "M", "T", "W", "T", "F", "S"];

  const goPrev = () => {
    setCursor(prev => {
      const m = prev.month - 1;
      if (m < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: m };
    });
  };

  const goNext = () => {
    setCursor(prev => {
      const m = prev.month + 1;
      if (m > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: m };
    });
  };

  return (
    <Stack spacing={0.6}>

      {/* HEADER NAV */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ fontSize: 11, opacity: .8 }}>
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* WEEKDAY HEADER */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "3px",
        }}
      >
        {weekday.map(w => (
          <Typography
            key={w}
            sx={{
              fontSize: 9,
              opacity: .45,
              textAlign: "center"
            }}
          >
            {w}
          </Typography>
        ))}
      </Box>

      {/* CALENDAR GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "3px",
          "@keyframes flame": {
            "0%": { transform: "scale(1)", opacity: 0.8 },
            "50%": { transform: "scale(1.25)", opacity: 1 },
            "100%": { transform: "scale(1)", opacity: 0.8 }
          }
        }}
      >
        {cells.map((c, i) => {

          if (!c.day) {
            return <Box key={i} sx={{ height: 20 }} />;
          }

          const isCurrentStreak = c.dateStr && current.includes(c.dateStr);
          const isLongestStreak = c.dateStr && longest.includes(c.dateStr);

          let bg = "rgba(255,255,255,0.05)";

          if (!c.future) {

            if (isCurrentStreak) {
              bg = "linear-gradient(135deg,#ff7b00,#ff3d00)";
            }
            else if (isLongestStreak) {
              bg = "linear-gradient(135deg,#ffd700,#ffb300)";
            }
            else {
              bg = c.done
                ? "rgba(0,255,166,0.85)"
                : "rgba(255,70,70,0.7)";
            }

          }

          return (
            <Box
              key={i}
              onClick={() => {
                if (c.dateStr) {
                  onToggleDate?.(c.dateStr);
                }
              }}
              sx={{
                height: 20,
                borderRadius: 1,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                color: c.done ? "#001a12" : "white",
                fontWeight: 600,
                cursor: "pointer",

                "&:hover": {
                  transform: "scale(1.05)"
                }
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >

                {isCurrentStreak && (
                  <Typography
                    sx={{
                      position: "absolute",
                      right: 5,
                      fontSize: 12,
                      animation: "flame 1.4s infinite"
                    }}
                  >
                    🔥
                  </Typography>
                )}

                {isLongestStreak && (
                  <Typography
                    sx={{
                      position: "absolute",
                      left: 5,
                      fontSize: 12
                    }}
                  >
                    🏆
                  </Typography>
                )}

                {c.day}

              </Box>
            </Box>
          );
        })}
      </Box>

    </Stack>
  );
}