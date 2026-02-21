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
import { Group, Routine, Todo } from "../../types/todoModels";
import RoutineHeatmap from "./RoutineHeatmap";
import RoutineMonthCalendar from "./RoutineMonthCalendar";
import TodoMonthCalendar from "./TodoMonthCalendar";
import CheckIcon from "@mui/icons-material/Checklist";

type Props = {
  routines: Routine[];
  todos: Todo[];   // ✅ add this
   groups: Group[];
};
type RangeType = "1m" | "3m" | "6m" | "1y" | "5y";

export default function DashboardView({ routines, todos, groups }: Props) {

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
    <Stack spacing={3} >

      {/* HEADER */}
      <Stack direction="row" spacing={1} alignItems="center">
        <InsightsIcon sx={{ opacity: .8 }} />
        <Typography fontWeight={700} variant="h5">
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
                p: 1.3,
                borderRadius: 1.2,
                position: "relative",

                background:
                  "linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",

                border: "1px solid rgba(255,255,255,0.08)",

                backdropFilter: "blur(14px)",

                transition: "all .25s ease",

                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)"
                }
              }}
            >
              {/* ===== HEADER ===== */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={0.6}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    opacity: .95,
                    fontWeight: 600,
                    letterSpacing: ".2px"
                  }}
                >
                  🔁 {r.title}
                </Typography>

                {/* subtle streak badge */}
                <Typography
                  sx={{
                    fontSize: 11,
                    px: .8,
                    py: .1,
                    borderRadius: 999,
                    background: "rgba(0,255,170,0.12)",
                    color: "#00ffa6"
                  }}
                >
                  {stats.total} active
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5}>

                {/* ===== LEFT STAT COLUMN ===== */}
                <Stack
                  spacing={1}
                  sx={{
                    minWidth: 76,
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    pr: 1,
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#ff784e" }}>
                      {stats.longest}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .5 }}>
                      LONGEST
                    </Typography>
                  </Stack>

                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#00ffa6" }}>
                      {Math.round(percent)}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .5 }}>
                      CONSIST
                    </Typography>
                  </Stack>

                  <Stack alignItems="center" spacing={0}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .5 }}>
                      ACTIVE
                    </Typography>
                  </Stack>
                </Stack>

                {/* ===== RIGHT CONTENT ===== */}
                <Stack flex={1} spacing={0.9}>

                  {/* ANALYSIS BOX */}
                  <Stack
                    spacing={0.4}
                    sx={{
                      p: .6,
                      borderRadius: 1,
                      background:
                        "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: .85 }}>
                      🔥 Longest streak is {insight.bestWeek} days
                    </Typography>

                    <Typography variant="caption" sx={{ opacity: .75 }}>
                      ⚠️ Drops {insight.worstDay}
                    </Typography>

                    <Typography variant="caption" sx={{ opacity: .7 }}>
                      {insight.trend}
                    </Typography>
                  </Stack>

                  {/* ===== CALENDAR ===== */}
                  <RoutineMonthCalendar routine={r} />
                </Stack>

              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <CheckIcon sx={{ opacity: .8 }} />
        <Typography fontWeight={700} variant="h5">
          Todo Tasks Calender
        </Typography>
      </Stack>

      <TodoMonthCalendar
        todos={todos}
        groups={groups}
      />

    </Stack>
  );
}
