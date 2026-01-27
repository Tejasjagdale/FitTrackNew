import {
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery
} from "@mui/material";

import WhatshotIcon from "@mui/icons-material/Whatshot";

import { Task } from "../../types/todoModels";

/* ================= HELPERS ================= */

function getTier(days: number) {
  if (days >= 365) return "Legend";
  if (days >= 180) return "Master";
  if (days >= 90) return "Elite";
  if (days >= 30) return "Pro";
  if (days >= 14) return "Rising";
  return "Beginner";
}

function getTierColor(tier: string) {
  switch (tier) {
    case "Legend":
      return "#f5c542";
    case "Master":
      return "#9c27b0";
    case "Elite":
      return "#2196f3";
    case "Pro":
      return "#4caf50";
    case "Rising":
      return "#ff9800";
    default:
      return "#90a4ae";
  }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const topId = streakTasks[0]?.id;

  if (!streakTasks.length) {
    return (
      <Typography color="text.secondary">
        No streaks yet. Start today 🔥
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "repeat(auto-fill, minmax(90px,1fr))",
          sm: "repeat(auto-fill, minmax(120px,1fr))"
        },

        gap: { xs: 1, sm: 2 }
      }}
    >
      {streakTasks.map(task => {
        const days = task.streak!.current;

        const tier = getTier(days);
        const color = getTierColor(tier);

        const target = getNextTarget(days);

        const progress =
          Math.min(days / target, 1) * 360;

        const isTop = task.id === topId;

        const isNear = days / target > 0.85;

        return (
          <Box
            key={task.id}
            sx={{
              position: "relative",

              borderRadius: "50%",
              aspectRatio: "1 / 1",

              background: `
                radial-gradient(
                  circle at 30% 20%,
                  ${color}25,
                  #020617 70%
                )
              `,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              transition: "all .2s ease",

              transform: isTop
                ? "scale(1.05)"
                : "none",

              boxShadow: isTop
                ? `0 0 25px ${color}`
                : `0 0 12px ${color}40`,

              animation: isNear
                ? "pulse 1.5s infinite"
                : "none",

              "@keyframes pulse": {
                "0%": {
                  boxShadow: `0 0 12px ${color}40`
                },
                "50%": {
                  boxShadow: `0 0 25px ${color}`
                },
                "100%": {
                  boxShadow: `0 0 12px ${color}40`
                }
              },

              "&:hover": {
                transform: "scale(1.06)"
              }
            }}
          >
            {/* ================= PROGRESS RING ================= */}

            <Box
              sx={{
                position: "absolute",

                inset: {
                  xs: 4,
                  sm: 6
                },

                borderRadius: "50%",

                background: `conic-gradient(
                  ${color} ${progress}deg,
                  rgba(255,255,255,0.1) 0deg
                )`
              }}
            />

            {/* ================= INNER CORE ================= */}

            <Box
              sx={{
                position: "absolute",

                inset: {
                  xs: 9,
                  sm: 14
                },

                borderRadius: "50%",

                background:
                  "linear-gradient(135deg,#020617,#020617)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Stack
                alignItems="center"
                spacing={0.15}
              >
                <WhatshotIcon
                  sx={{
                    color,

                    fontSize: {
                      xs: 18,
                      sm: 26
                    },

                    filter:
                      `drop-shadow(0 0 5px ${color})`
                  }}
                />

                <Typography
                  fontWeight={700}
                  fontSize={{
                    xs: "0.7rem",
                    sm: "0.9rem"
                  }}
                >
                  {days}
                </Typography>

                {!isMobile && (
                  <Typography
                    fontSize="0.55rem"
                    color="rgba(255,255,255,0.6)"
                  >
                    / {target}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* ================= TIER BADGE ================= */}

            {!isMobile && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -6,

                  px: 1,
                  py: 0.2,

                  borderRadius: 2,

                  background: color,

                  color: "#000",

                  fontSize: "0.55rem",

                  fontWeight: 700,

                  textTransform: "uppercase",

                  boxShadow:
                    "0 2px 6px rgba(0,0,0,.5)"
                }}
              >
                {tier}
              </Box>
            )}

            {/* ================= TITLE ================= */}

            <Typography
              sx={{
                position: "absolute",
                top: "100%",

                mt: 0.4,

                width: "100%",

                textAlign: "center",

                fontSize: {
                  xs: "0.6rem",
                  sm: "0.7rem"
                },

                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",

                color: "#aaa"
              }}
            >
              {task.title}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
