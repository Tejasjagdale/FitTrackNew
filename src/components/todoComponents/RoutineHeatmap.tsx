import {
  Box,
  Stack,
  Typography,
  IconButton,
  useTheme,
  Chip
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo, useState } from "react";
import { Routine } from "../../types/todoModels";

/* ========================= */

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function buildData(routines: Routine[], year: number, month: number) {
  const map: Record<string, number> = {};

  routines.forEach(r => {
    (r.history ?? []).forEach(date => {
      map[date] = (map[date] ?? 0) + 1;
    });
  });

  const total = routines.length || 1;

  const firstDay = new Date(year, month, 1);
  const start = firstDay.getDay();
  const days = new Date(year, month + 1, 0).getDate();

  const cells: any[] = [];

  for (let i = 0; i < start; i++) cells.push({});

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const str = toDateStr(date);

    const count = map[str] ?? 0;
    const percent = count / total;

    let level = 0;
    if (percent === 0) level = 0;
    else if (percent < 0.33) level = 1;
    else if (percent < 0.66) level = 2;
    else level = 3;

    cells.push({ day: d, count, level });
  }

  while (cells.length % 7 !== 0) cells.push({});
  return cells;
}

/* ========================= */

export default function RoutineCalendarGrid({
  routines
}: {
  routines: Routine[];
}) {
  const theme = useTheme();
  const now = new Date();

  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth()
  });

  const cells = useMemo(
    () => buildData(routines, cursor.year, cursor.month),
    [routines, cursor]
  );

  const monthLabel = new Date(cursor.year, cursor.month).toLocaleString(
    "en-IN",
    { month: "long", year: "numeric" }
  );

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

  /* 🔥 color only on badge */
  const getBadgeColor = (level: number) => {
    if (level === 0) return theme.palette.grey[700];
    if (level === 1) return theme.palette.error.main;
    if (level === 2) return theme.palette.primary.main;
    return theme.palette.success.main;
  };

  const weekday = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Stack spacing={1.2}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between">
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography fontWeight={700} fontSize={13}>
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {/* WEEK */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 4
        }}
      >
        {weekday.map(w => (
          <Typography
            key={w}
            sx={{ fontSize: 10, opacity: 0.5, textAlign: "center" }}
          >
            {w}
          </Typography>
        ))}
      </Box>

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        {cells.map((c, i) => {
          if (!c.day) {
            return (
              <Box
                key={i}
                sx={{
                  height: 70,
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}
              />
            );
          }

          const color = getBadgeColor(c.level);

          return (
            <Box
              key={i}
              sx={{
                height: 70,
                p: 0.8,
                borderRight: (i + 1) % 7 !== 0
                  ? `1px solid ${theme.palette.divider}`
                  : "none",
                borderBottom:
                  i < cells.length - 7
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: `${color}22`
              }}
            >
              {/* DATE BADGE */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  background: `${color}66`,
                  // color: color,
                  border: `1px solid ${color}55`,

                }}
              >
                {c.day}
              </Box>

              {/* COUNT */}
              {c.count > 0 && (
                <Typography
                  fontSize={11}
                  sx={{
                    alignSelf: "flex-end",
                    fontWeight: 600,
                    opacity: 0.85
                  }}
                >
                 {c.count}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}