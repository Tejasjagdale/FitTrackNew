import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  LinearProgress,
  TextField,
  MenuItem
} from "@mui/material";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import { useMemo, useState } from "react";
import { Routine } from "../../types/todoModels";

type Props = {
  routines: Routine[];
};

type RangeType = "1m" | "3m" | "6m" | "1y" | "5y";

export default function DashboardView({ routines }: Props) {

  const [selectedId, setSelectedId] = useState<string>(
    routines[0]?.id ?? "all"
  );

  const [range, setRange] = useState<RangeType>("1m");

  /* ===== HELPER: BUILD STATS FOR ONE ROUTINE ===== */

  const buildStats = (routine: Routine) => {

    if (!routine?.history) {
      return { total: 0, possible: 0, longest: routine?.streak?.longest ?? 0, timeline: [] };
    }

    const now = new Date();

    const months =
      range === "1m" ? 1 :
        range === "3m" ? 3 :
          range === "6m" ? 6 :
            range === "1y" ? 12 : 60;

    const cutoff = new Date();
    cutoff.setMonth(now.getMonth() - months);

    const filtered = routine.history.filter(h =>
      new Date(h.date) >= cutoff
    );

    const diffDays =
      Math.floor(
        (now.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24)
      );

    const timeline: number[] = [];

    for (let i = 0; i < diffDays; i += Math.ceil(diffDays / 40)) {
      const day = new Date();
      day.setDate(now.getDate() - i);

      const dayStr = day.toISOString().slice(0, 10);

      timeline.push(
        filtered.some(h => h.date === dayStr) ? 1 : 0
      );
    }

    return {
      total: filtered.length,
      possible: diffDays,
      longest: routine.streak?.longest ?? 0,
      timeline: timeline.reverse()
    };
  };

  /* ===== SELECTED ROUTINES ===== */

  const routinesToShow =
    selectedId === "all"
      ? routines
      : routines.filter(r => r.id === selectedId);

  return (
    <Stack spacing={3}>

      <Typography fontSize={18} fontWeight={700}>
        Routine Analytics
      </Typography>

      {/* ===== DROPDOWN ===== */}
      <TextField
        select
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

      {/* ===== RANGE SELECTOR ===== */}
      <Stack direction="row" spacing={1}>
        {(["1m", "3m", "6m", "1y", "5y"] as RangeType[]).map(r => (
          <Button
            key={r}
            size="small"
            variant={range === r ? "contained" : "outlined"}
            onClick={() => setRange(r)}
          >
            {r.toUpperCase()}
          </Button>
        ))}
      </Stack>

      {/* ===== ANALYTICS CARDS ===== */}
      <Stack spacing={2}>
        {routinesToShow.map(r => {

          const stats = buildStats(r);

          const completionPercent =
            stats.possible === 0
              ? 0
              : (stats.total / stats.possible) * 100;

          return (
            <Paper key={r.id} sx={{ p: 2, borderRadius: 2 }}>

              <Stack spacing={2}>

                <Typography fontSize={20} fontWeight={700}>
                  {r.title}
                </Typography>

                <Stack direction="row" justifyContent="space-between">

                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LocalFireDepartmentIcon sx={{ color: "#ff784e" }} />
                      <Typography fontSize={28} fontWeight={800}>
                        {stats.longest}
                      </Typography>
                    </Stack>
                    <Typography variant="caption">
                      Longest Streak
                    </Typography>
                  </Box>

                  <Box>
                    <Typography fontSize={28} fontWeight={800}>
                      {stats.total}/{stats.possible}
                    </Typography>
                    <Typography variant="caption">
                      Completed ({range.toUpperCase()})
                    </Typography>
                  </Box>

                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={completionPercent}
                  sx={{ height: 10, borderRadius: 999 }}
                />

                <Box sx={{
                  display: "flex", gap: 0.5, alignItems: "flex-end", height: 40,
                }}>
                  {stats.timeline.map((v, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 4,
                        height: v ? 32 : 10,
                        borderRadius: 1,
                        background: v
                          ? "#00ffa6"
                          : "rgba(255,255,255,0.15)"
                      }}
                    />
                  ))}
                </Box>

              </Stack>

            </Paper>
          );
        })}
      </Stack>

    </Stack>
  );
}
