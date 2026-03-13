import { Box, Stack, Typography, Tooltip, useTheme } from "@mui/material";
import { Routine } from "../../types/todoModels";
import { useEffect, useRef } from "react";

/* ======================================================
   IST SAFE DATE FORMATTERS
   ====================================================== */

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toPretty = (str: string) => {
  const d = new Date(str);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

/* ======================================================
   BUILD DAILY COMPLETION MAP
   ====================================================== */

function buildDailyCompletion(routines: Routine[]) {

  const doneMap: Record<string, number> = {};

  routines.forEach(r => {
    (r.history ?? []).forEach(date => {
      doneMap[date] = (doneMap[date] ?? 0) + 1;
    });
  });

  const routineCount = routines.length || 1;

  const today = new Date();

  const days: {
    date: string;
    level: number;
    count: number;
    month: number;
  }[] = [];

  for (let i = 364; i >= 0; i--) {

    const d = new Date();
    d.setDate(today.getDate() - i);

    const str = toDateStr(d);

    const done = doneMap[str] ?? 0;
    const percent = done / routineCount;
    let level = 0;

    if (percent > 0 && percent < 0.3) {
      level = 1;        // red (missed)
    }
    else if (percent > 0.3 && percent < 0.7) {
      level = 2;        // blue (partial)
    }
    else if (percent >= 0.7) {
      level = 3;        // green (good)
    } 
    days.push({
      date: str,
      level,
      count: done,
      month: d.getMonth()
    });
  }

  return days;
}

/* ======================================================
   GITHUB COLOR SCALE
   ====================================================== */

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];



/* ======================================================
   COMPONENT
   ====================================================== */

export default function RoutineHeatmap({
  routines
}: {
  routines: Routine[];
}) {
  const theme = useTheme();

  const colors = [
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.05)",

    theme.palette.error.main,     // red
    theme.palette.primary.main,   // blue
    theme.palette.success.main    // green
  ];

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);
  const days = buildDailyCompletion(routines);

  /* ===== WEEK COLUMNS ===== */

  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  /* ===== MONTH LABELS ===== */

  let lastMonth = -1;
  const monthLabels: { label: string; index: number }[] = [];

  weeks.forEach((week, i) => {
    const m = week[0]?.month;
    if (m !== undefined && m !== lastMonth) {
      monthLabels.push({ label: months[m], index: i });
      lastMonth = m;
    }
  });

  /* ======================================================
     UI
     ====================================================== */

  return (
    <Stack spacing={0.5} sx={{ overflow: "hidden" }}>

      <Typography fontSize={13} sx={{ opacity: .8 }}>
        Routine Activity — Last 12 Months
      </Typography>

      <Box
        ref={scrollRef}
        sx={{
          overflowX: "auto",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <Box sx={{ width: "max-content" }}>

          {/* MONTH LABEL ROW */}
          <Box
            sx={{
              display: "flex",
              ml: "22px",
              mb: .3,
              gap: { xs: "1px", sm: "2px" , md: "4px" }
            }}
          >
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.index === wi);
              return (
                <Box key={wi} sx={{ width: { xs: 10, sm: 12 }, height: 14 }}>
                  {label && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        opacity: .6
                      }}
                    >
                      {label.label}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          <Stack direction="row" spacing={{ xs: "2px", sm: "3px" }}>

            {/* WEEKDAY LABELS */}
            <Stack spacing={{ xs: "2px", sm: "3px" }} sx={{ mr: .4 }}>
              {["Sun", "", "Tue", "", "Thu", "", "Sat"].map((d, i) => (
                <Typography key={i} sx={{ fontSize: 10, opacity: .5, height: 10 }}>
                  {d}
                </Typography>
              ))}
            </Stack>

            {/* GRID */}
            {weeks.map((week, wi) => (
              <Stack key={wi} spacing={{ xs: "2px", sm: "3px" }}>
                {week.map((d, di) => (

                  <Tooltip
                    key={di}
                    arrow
                    title={`${d.count} routines completed on ${toPretty(d.date)}`}
                  >
                    <Box
                      sx={{
                        width: { xs: 9, sm: 11, md: 13 },
                        height: { xs: 9, sm: 11, md: 13 },
                        borderRadius: "2px",
                        background: colors[d.level],
                        transition: "all .15s ease",
                        "&:hover": {
                          transform: "scale(1.25)",
                          boxShadow: `0 0 6px ${theme.palette.primary.main}`,
                          zIndex: 2
                        }
                      }}
                    />
                  </Tooltip>

                ))}
              </Stack>
            ))}

          </Stack>

        </Box>
      </Box>

      {/* LEGEND */}
      <Stack
        direction="row"
        spacing={0.6}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mt: .2 }}
      >
        <Typography fontSize={11} sx={{ opacity: .6 }}>
          Less Tasks
        </Typography>

        {colors.map((c, i) => (
          <Box
            key={i}
            sx={{
              width: 12,
              height: 12,
              borderRadius: 1,
              background: c
            }}
          />
        ))}

        <Typography fontSize={11} sx={{ opacity: .6 }}>
          More Tasks
        </Typography>
      </Stack>

    </Stack>
  );
}
