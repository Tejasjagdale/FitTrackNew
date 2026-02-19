import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Tooltip
} from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";

import { useState } from "react";
import { Routine } from "../../types/todoModels";
import RoutineHeatmap from "./RoutineHeatmap";

type Props = {
  routines: Routine[];
};

type RangeType = "1m" | "3m" | "6m" | "1y" | "5y";

export default function DashboardView({ routines }: Props) {

  const [selectedId, setSelectedId] = useState<string>(
    routines[0]?.id ?? "all"
  );

  const [range, setRange] = useState<RangeType>("1m");

  /* ======================================================
     INSIGHT ENGINE
  ====================================================== */

  const analyzeRoutine = (routine: Routine) => {

    const history = routine.history ?? [];

    const today = new Date();
    const nowMonth = today.getMonth();

    const weekdayCount = [0, 0, 0, 0, 0, 0, 0];

    history.forEach(d => {
      const day = new Date(d).getDay();
      weekdayCount[day]++;
    });

    const worstDayIndex = weekdayCount.indexOf(
      Math.min(...weekdayCount)
    );

    const weekdayNames = [
      "Sunday", "Monday", "Tuesday",
      "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    /* ===== BEST STREAK WINDOW ===== */

    let bestWeek = 0;
    let current = 0;

    const sorted = [...history].sort();

    for (let i = 0; i < sorted.length; i++) {

      if (i === 0) {
        current = 1;
        bestWeek = 1;
        continue;
      }

      const prev = new Date(sorted[i - 1]);
      const cur = new Date(sorted[i]);

      const diff =
        (cur.getTime() - prev.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
        bestWeek = Math.max(bestWeek, current);
      } else {
        current = 1;
      }
    }

    /* ===== MONTH TREND ===== */

    const thisMonth = history.filter(
      h => new Date(h).getMonth() === nowMonth
    ).length;

    const lastMonth = history.filter(
      h => new Date(h).getMonth() === nowMonth - 1
    ).length;

    const trend =
      thisMonth > lastMonth
        ? "📈 Improving vs last month"
        : thisMonth < lastMonth
          ? "📉 Slower than last month"
          : "➖ Same as last month";

    return {
      worstDay: weekdayNames[worstDayIndex],
      bestWeek,
      trend
    };
  };

  /* ======================================================
     BUILD STATS (TRUE DAY BY DAY)
  ====================================================== */

  const buildStats = (routine: Routine) => {

    if (!routine?.history?.length) {
      return {
        total: 0,
        possible: 0,
        longest: 0,
        timeline: [] as { date: string; done: boolean }[]
      };
    }

    const now = new Date();

    const months =
      range === "1m" ? 1 :
        range === "3m" ? 3 :
          range === "6m" ? 6 :
            range === "1y" ? 12 : 60;

    const cutoff = new Date();
    cutoff.setMonth(now.getMonth() - months);

    const filtered = routine.history.filter(date =>
      new Date(date) >= cutoff
    );

    const diffDays =
      Math.floor(
        (now.getTime() - cutoff.getTime()) /
        (1000 * 60 * 60 * 24)
      );

    const timeline: { date: string; done: boolean }[] = [];

    for (let i = diffDays; i >= 0; i--) {

      const day = new Date();
      day.setDate(now.getDate() - i);

      const str = day.toISOString().slice(0, 10);

      timeline.push({
        date: str,
        done: filtered.includes(str)
      });
    }

    return {
      total: filtered.length,
      possible: diffDays,
      longest: routine.streak?.longest ?? 0,
      timeline
    };
  };

  const routinesToShow =
    selectedId === "all"
      ? routines
      : routines.filter(r => r.id === selectedId);

  /* ======================================================
     UI
  ====================================================== */

  return (
    <Stack spacing={3}>

      {/* HEADER */}
      <Stack direction="row" spacing={1} alignItems="center">
        <InsightsIcon sx={{ opacity: .8 }} />
        <Typography fontWeight={700} fontSize={18}>
          Routine Intelligence
        </Typography>
      </Stack>

      {/* GLOBAL HEATMAP */}
      <RoutineHeatmap routines={routines} />

      {/* ROUTINE SELECT */}
      <TextField
        select
        size="small"
        label="Select Routine"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <MenuItem value="all">See All</MenuItem>
        {routines.map(r => (
          <MenuItem key={r.id} value={r.id}>
            {r.title}
          </MenuItem>
        ))}
      </TextField>

      {/* RANGE SELECT */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {(["1m", "3m", "6m", "1y", "5y"] as RangeType[]).map(r => (
          <Button
            key={r}
            size="small"
            variant={range === r ? "contained" : "outlined"}
            onClick={() => setRange(r)}
            sx={{ borderRadius: 3, padding: 0 }}
          >
            {r.toUpperCase()}
          </Button>
        ))}
      </Stack>

      {/* ROUTINE CARDS */}
      <Stack spacing={2}>
        {routinesToShow.map(r => {

          const stats = buildStats(r);
          const insight = analyzeRoutine(r);

          const percent =
            stats.possible === 0
              ? 0
              : (stats.total / stats.possible) * 100;

          return (
            <Paper
              key={r.id}
              sx={{
                p: 1.2,
                borderRadius: 1,
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                border: "1px solid rgba(255,255,255,0.08)",
                overflow: "hidden"
              }}
            >
              {/* TITLE */}
              <Typography
                sx={{
                  fontSize: 14,
                  opacity: .95,
                  mb: .5
                }}
              >
                <b>Routine :</b> {r.title}
              </Typography>

              <Stack direction="row" spacing={1.4}>

                {/* LEFT STAT COLUMN */}
                <Stack
                  spacing={1}
                  sx={{
                    minWidth: 70,
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: .3
                  }}
                >
                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 13, fontWeight: 300, color: "#ff784e" }}>
                      {stats.longest}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .6 }}>
                      LONGEST
                    </Typography>
                  </Stack>

                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 13, fontWeight: 300, color: "#00ffa6" }}>
                      {Math.round(percent)}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .6 }}>
                      CONSIST
                    </Typography>
                  </Stack>

                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 13, fontWeight: 300 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .6 }}>
                      ACTIVE
                    </Typography>
                  </Stack>
                </Stack>

                {/* RIGHT CONTENT */}
                <Stack flex={1} spacing={0.8}>

                  {/* ANALYSIS */}
                  <Stack spacing={0.6} sx={{ opacity: .85 }}>
                    <Typography variant="caption">
                      🔥 Longest streak is {insight.bestWeek} days
                    </Typography>

                    <Typography variant="caption">
                      ⚠️ Drops {insight.worstDay}
                    </Typography>

                    <Typography variant="caption">
                      {insight.trend}
                    </Typography>
                  </Stack>
                  {/* ===== TIME BAND — TRUE DATE VISUAL ===== */}
                  <Box
                    sx={{
                      mt: .6,
                      borderRadius: 2,
                      px: .6,
                      py: .5,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                      border: "1px solid rgba(255,255,255,0.05)",
                      overflow:"scroll",
                      "&::-webkit-scrollbar": { display: "none" },
                      scrollbarWidth: "none"
                    }}
                  >
                    {/* ===== MONTH LABELS ===== */}
                    <Stack
                      direction="row"
                      sx={{
                        overflowX: "auto",
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                        mb: .4
                      }}
                    >
                      {stats.timeline.map((d, i) => {

                        const date = new Date(d.date);

                        const showMonth =
                          i === 0 ||
                          date.getDate() === 1; // show label when month starts

                        if (!showMonth) {
                          return <Box key={i} sx={{ width: 6 }} />;
                        }

                        return (
                          <Typography
                            key={i}
                            variant="caption"
                            sx={{
                              width: 40,
                              fontSize: 10,
                              opacity: .55
                            }}
                          >
                            {date.toLocaleDateString("en-IN", { month: "short" })}
                          </Typography>
                        );
                      })}
                    </Stack>

                    {/* ===== DAILY COMPLETION BAND ===== */}
                    <Stack
                      direction="row"
                      alignItems="flex-end"
                      sx={{
                        overflowX: "auto",
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                        gap: "2px"
                      }}
                    >
                      {stats.timeline.map((d, i) => {

                        const prettyDate = new Date(d.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        });

                        return (
                          <Tooltip
                            key={i}
                            arrow
                            title={
                              d.done
                                ? `✔ Completed on ${prettyDate}`
                                : `✖ Missed on ${prettyDate}`
                            }
                          >
                            <Box
                              sx={{
                                width: 5,
                                height: d.done ? 20 : 8,
                                borderRadius: 1,
                                background: d.done
                                  ? "linear-gradient(#00ffa6,#0bbf87)"
                                  : "rgba(255,255,255,0.15)",
                                transition: "all .15s ease",
                                "&:hover": {
                                  transform: "scaleY(1.2)"
                                }
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </Box>

                </Stack>

              </Stack>
            </Paper>
          );
        })}
      </Stack>

    </Stack>
  );
}
