import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Drawer,
  Divider,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo, useState } from "react";

/* ========================= */

function getISTDate(date = new Date()) {
  const istOffset = 5.5 * 60;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset * 60000);
}

function getISTDateParts(date = new Date()) {
  const d = getISTDate(date);

  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  };
}


function buildCalendar(data: any[], year: number, month: number) {
  const map: Record<string, any> = {};
  data.forEach(d => {
    map[d.date] = d;
  });

  const first = getISTDate(new Date(Date.UTC(year, month, 1)));
  const start = first.getDay();
  const total = getISTDate(new Date(Date.UTC(year, month + 1, 0))).getDate();

  const cells: any[] = [];

  for (let i = 0; i < start; i++) cells.push({});

  for (let d = 1; d <= total; d++) {
    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const entry = map[dateStr];

    let level = 0;
    if (entry) {
      const ratio = entry.calories / entry.targetCalories;
      if (ratio < 0.5) level = 1;
      else if (ratio < 0.8) level = 2;
      else level = 3;
    }

    cells.push({ day: d, entry, level, dateStr });
  }

  while (cells.length % 7 !== 0) cells.push({});
  return cells;
}

/* ========================= */

export default function NutritionHistoryDialog({
  data,
  onDateClick,
  onEditDay
}: any) {
  const theme = useTheme();
  const now = new Date();

  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth()
  });

  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  const cells = useMemo(
    () => buildCalendar(data, cursor.year, cursor.month),
    [data, cursor]
  );

  const monthLabel = getISTDate(
    new Date(Date.UTC(cursor.year, cursor.month))
  ).toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });

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

  const getColor = (level: number) => {
    if (level === 0) return "transparent";
    if (level === 1) return `${theme.palette.error.main}18`;
    if (level === 2) return `${theme.palette.primary.main}20`;
    return `${theme.palette.success.main}26`;
  };

  return (
    <>
      {/* MAIN POPUP */}
      <Box p={2}>

        {/* MONTH NAV */}
        <Stack direction="row" justifyContent="space-between" mt={1} mb={2}>
          <IconButton size="small" onClick={goPrev}>
            <ChevronLeftIcon />
          </IconButton>

          <Typography fontSize={12} color={theme.palette.text.secondary} >
            {monthLabel}
          </Typography>

          <IconButton size="small" onClick={goNext}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        {/* GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: "hidden"
          }}
        >
          {cells.map((c, i) => {
            if (!c.day) {
              return <Box key={i} sx={{ height: 72 }} />;
            }

            return (
              <Box
                key={i}
                onClick={() => {
                  if (c.day) onDateClick(c);
                }}
                sx={{
                  height: 72,
                  p: 0.8,
                  cursor: c.entry ? "pointer" : "default",
                  borderRight: (i + 1) % 7 !== 0
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
                  borderBottom:
                    i < cells.length - 7
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                  background: getColor(c.level),
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                {/* DATE */}
                <Typography fontSize={10} color={theme.palette.text.secondary} fontWeight={700}>
                  {c.day}
                </Typography>

                {/* SUMMARY ONLY */}
                {c.entry && (
                  <Box color={theme.palette.text.primary}>
                    <Typography fontSize={11} fontWeight={700}>
                      <b style={{ fontSize: 12 }}>{c.entry.calories}</b> Kcal
                    </Typography>

                    <Typography fontSize={9} sx={{ opacity: 0.7 }}>
                      P-{c.entry.protein}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

    </>
  );
}