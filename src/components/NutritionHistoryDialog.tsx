import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Drawer,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo, useState } from "react";

/* ========================= */

function buildCalendar(data: any[], year: number, month: number) {
  const map: Record<string, any> = {};
  data.forEach(d => {
    map[d.date] = d;
  });

  const first = new Date(year, month, 1);
  const start = first.getDay();
  const total = new Date(year, month + 1, 0).getDate();

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
  open,
  onClose,
  data
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

  const getColor = (level: number) => {
    if (level === 0) return "transparent";
    if (level === 1) return `${theme.palette.error.main}18`;
    if (level === 2) return `${theme.palette.primary.main}20`;
    return `${theme.palette.success.main}26`;
  };

  return (
    <>
      {/* MAIN POPUP */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box p={2}>

          {/* HEADER */}
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={600}>
              Nutrition Intelligence
            </Typography>

            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* MONTH NAV */}
          <Stack direction="row" justifyContent="space-between" mt={1} mb={2}>
            <IconButton size="small" onClick={goPrev}>
              <ChevronLeftIcon />
            </IconButton>

            <Typography fontSize={12} sx={{ opacity: 0.7 }}>
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
                  onClick={() => c.entry && setSelectedDay(c)}
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
                  <Typography fontSize={10} fontWeight={700}>
                    {c.day}
                  </Typography>

                  {/* SUMMARY ONLY */}
                  {c.entry && (
                    <Box>
                      <Typography fontSize={11} fontWeight={700}>
                        <b style={{ fontSize:12 }}>{c.entry.calories}</b> Kcal
                      </Typography>

                      <Typography fontSize={9} sx={{ opacity: 0.7 }}>
                        P{c.entry.protein}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Dialog>

      {/* 🔥 DETAIL POPUP */}
      <Dialog
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        maxWidth="xs"
        fullWidth
      >
        {selectedDay && (
          <Box p={2}>

            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>
                {selectedDay.dateStr}
              </Typography>

              <IconButton size="small" onClick={() => setSelectedDay(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* CALORIES BIG */}
            <Typography variant="h6" fontWeight={700} mt={1}>
              {selectedDay.entry.calories} kcal
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* 🔥 COMPARISON GRID */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                rowGap: 1.5,
                columnGap: 2,
                alignItems: "center"
              }}
            >
              {/* HEADER */}
              <Typography></Typography>
              <Typography fontSize={12} sx={{ opacity: 0.6 }}>
                Actual
              </Typography>
              <Typography fontSize={12} sx={{ opacity: 0.6 }}>
                Target
              </Typography>

              {/* CALORIES */}
              <Typography fontWeight={600}>Calories</Typography>
              <Typography
                color={
                  selectedDay.entry.calories >=
                    selectedDay.entry.targets?.targetCalories * 0.9
                    ? "success.main"
                    : "error.main"
                }
              >
                {selectedDay.entry.calories}
              </Typography>
              <Typography>
                {selectedDay.entry.targets?.targetCalories ?? "-"}
              </Typography>

              {/* PROTEIN */}
              <Typography fontWeight={600}>Protein</Typography>
              <Typography
                color={
                  selectedDay.entry.protein >=
                    selectedDay.entry.targets?.proteinTarget
                    ? "success.main"
                    : "error.main"
                }
              >
                {selectedDay.entry.protein}g
              </Typography>
              <Typography>
                {selectedDay.entry.targets?.proteinTarget ?? "-"}g
              </Typography>

              {/* CARBS */}
              <Typography fontWeight={600}>Carbs</Typography>
              <Typography>{selectedDay.entry.carbs}g</Typography>
              <Typography>
                {selectedDay.entry.targets?.carbTarget ?? "-"}g
              </Typography>

              {/* FATS */}
              <Typography fontWeight={600}>Fats</Typography>
              <Typography>{selectedDay.entry.fats}g</Typography>
              <Typography>
                {selectedDay.entry.targets?.fatTarget ?? "-"}g
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* MEALS */}
            <Typography fontWeight={600}>Meals</Typography>

            <Box sx={{ maxHeight: 140, overflowY: "auto", mt: 1 }}>
              {selectedDay.entry?.meals?.length > 0 ? (
                selectedDay.entry.meals.map((m: string, i: number) => (
                  <Typography key={i} fontSize={13} sx={{ opacity: 0.8, mb: 0.5 }}>
                    • {m}
                  </Typography>
                ))
              ) : (
                <Typography fontSize={13} sx={{ opacity: 0.5 }}>
                  No meals logged
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}