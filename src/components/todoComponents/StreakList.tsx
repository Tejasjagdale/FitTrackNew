import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress
} from "@mui/material";

import WhatshotIcon from "@mui/icons-material/Whatshot";

import { Task } from "../../types/todoModels";

/* ================= HELPERS ================= */

function getLevel(days: number) {
  if (days >= 365) return "Legend";
  if (days >= 180) return "Master";
  if (days >= 90) return "Elite";
  if (days >= 30) return "Pro";
  if (days >= 14) return "Rising";
  return "Beginner";
}

function getNextTarget(days: number) {
  if (days < 14) return 14;
  if (days < 30) return 30;
  if (days < 90) return 90;
  if (days < 180) return 180;
  if (days < 365) return 365;
  return 365;
}

/* ================= COMPONENT ================= */

export default function StreakList({
  tasks
}: {
  tasks: Task[];
}) {
  const streakTasks = tasks
    .filter(
      t =>
        t.trackStreak &&
        t.streak &&
        t.streak.current > 0
    )
    .sort(
      (a, b) =>
        (b.streak?.current || 0) -
        (a.streak?.current || 0)
    );

  if (!streakTasks.length) {
    return (
      <Typography color="text.secondary">
        No active streaks yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {streakTasks.map(task => {
        const days = task.streak!.current;

        const level = getLevel(days);
        const target = getNextTarget(days);

        const progress =
          Math.min((days / target) * 100, 100);

        return (
          <Card
            key={task.id}
            elevation={0}
            sx={{
              borderRadius: 3,

              background:
                "linear-gradient(135deg,#0f172a,#1e293b)",

              color: "#fff",

              position: "relative",

              overflow: "hidden"
            }}
          >
            {/* Glow */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,

                background:
                  "radial-gradient(circle at top right, rgba(255,87,34,.2), transparent 60%)"
              }}
            />

            <CardContent>
              <Stack spacing={1.2}>
                {/* Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <WhatshotIcon
                    sx={{ color: "#ff5722" }}
                  />

                  <Typography fontWeight={700}>
                    {task.title}
                  </Typography>

                  <Box flex={1} />

                  <Typography
                    fontWeight={700}
                    color="#ff5722"
                  >
                    {days}d
                  </Typography>
                </Stack>

                {/* Level */}
                <Typography
                  fontSize="0.75rem"
                  color="#90caf9"
                >
                  Rank: {level}
                </Typography>

                {/* Progress */}
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 4,

                    background:
                      "rgba(255,255,255,.1)",

                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg,#ff5722,#ff9800)"
                    }
                  }}
                />

                {/* Target */}
                <Typography
                  fontSize="0.65rem"
                  color="text.secondary"
                >
                  Next goal: {target} days
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
