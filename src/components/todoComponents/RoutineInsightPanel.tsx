import { Paper, Stack, Typography, Box, LinearProgress } from "@mui/material";
import { Routine } from "../../types/todoModels";
import RoutineMonthCalendar from "./RoutineMonthCalendar";

type Props = {
  routine: Routine;
  stats: {
    total: number;
    possible: number;
    longest: number;
  };
  insight: {
    bestWeek: number;
    worstDay: string;
    trend: string;
  };
  percent: number;
};

export default function RoutineInsightCard({
  routine,
  stats,
  insight,
  percent
}: Props) {

  /* ======================================================
     ADVANCED DERIVED ANALYTICS (PURE UI LAYER)
  ====================================================== */

  const momentum = routine.streak?.current ?? 0;

  const density =
    stats.possible === 0 ? 0 : stats.total / stats.possible;

  const grade =
    percent >= 85 ? "A+" :
    percent >= 70 ? "A" :
    percent >= 55 ? "B" :
    percent >= 40 ? "C" : "D";

  const risk =
    percent < 30
      ? "🚨 Burnout risk"
      : percent < 50
        ? "⚠️ Inconsistent phase"
        : "🧠 Stable behaviour";

  const discipline =
    momentum > 10
      ? "Elite discipline"
      : momentum > 5
        ? "Building discipline"
        : "Early phase";

  const densityColor =
    percent > 70 ? "#00ffa6" :
    percent > 40 ? "#ffaa00" :
    "#ff6b6b";

  /* ====================================================== */

  return (
    <Paper
      sx={{
        p: 1.3,
        borderRadius: 1.3,
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

      {/* ================= HEADER ================= */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={0.6}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: ".2px"
          }}
        >
          🔁 {routine.title}
        </Typography>

        <Box
          sx={{
            px: .9,
            py: .1,
            borderRadius: 999,
            background: "rgba(0,255,170,0.12)",
            color: "#00ffa6",
            fontSize: 11,
            fontWeight: 600
          }}
        >
          Grade {grade}
        </Box>
      </Stack>

      {/* ================= PROGRESS STRIP ================= */}
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 4,
          borderRadius: 10,
          mb: .8,
          background: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            background: densityColor
          }
        }}
      />

      {/* ================= BODY ================= */}
      <Stack direction="row" spacing={1.5}>

        {/* LEFT METRICS COLUMN */}
        <Stack
          spacing={1}
          sx={{
            minWidth: 82,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            pr: 1,
            alignItems: "center"
          }}
        >
          <Metric label="MOMENTUM" value={momentum} color="#ff784e" />
          <Metric label="CONSIST" value={`${Math.round(percent)}%`} color="#00ffa6" />
          <Metric label="LONGEST" value={stats.longest} />
        </Stack>

        {/* RIGHT ANALYTICS */}
        <Stack flex={1} spacing={0.8}>

          {/* INSIGHT PANEL */}
          <Stack
            spacing={0.35}
            sx={{
              p: .7,
              borderRadius: 1,
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)"
            }}
          >
            <Typography variant="caption" sx={{ opacity: .85 }}>
              🔥 Longest streak window {insight.bestWeek} days
            </Typography>

            <Typography variant="caption" sx={{ opacity: .75 }}>
              ⚠️ Weak day: {insight.worstDay}
            </Typography>

            <Typography variant="caption" sx={{ opacity: .7 }}>
              {insight.trend}
            </Typography>

            <Typography variant="caption" sx={{ opacity: .65 }}>
              🧩 {discipline}
            </Typography>

            <Typography variant="caption" sx={{ opacity: .6 }}>
              {risk}
            </Typography>
          </Stack>

          {/* CALENDAR */}
          <RoutineMonthCalendar routine={routine} />

        </Stack>
      </Stack>
    </Paper>
  );
}

/* ======================================================
   SMALL INTERNAL METRIC COMPONENT
====================================================== */

function Metric({
  label,
  value,
  color
}: {
  label: string;
  value: any;
  color?: string;
}) {
  return (
    <Stack alignItems="center" spacing={0}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: color || "white"
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ opacity: .55 }}>
        {label}
      </Typography>
    </Stack>
  );
}