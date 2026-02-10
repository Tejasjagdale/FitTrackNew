import {
  Box,
  Typography,
  Stack,
  Paper,
  LinearProgress,
  Chip
} from "@mui/material";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

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
    case "Legend": return { primary: "#f5c542", bg: "rgba(245, 197, 66, 0.1)" };
    case "Master": return { primary: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)" };
    case "Elite": return { primary: "#2196f3", bg: "rgba(33, 150, 243, 0.1)" };
    case "Pro": return { primary: "#4caf50", bg: "rgba(76, 175, 80, 0.1)" };
    case "Rising": return { primary: "#ff9800", bg: "rgba(255, 152, 0, 0.1)" };
    default: return { primary: "#90a4ae", bg: "rgba(144, 164, 174, 0.1)" };
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
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
          border: '1px dashed rgba(255, 152, 0, 0.2)',
          borderRadius: 2
        }}
      >
        <LocalFireDepartmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          No streaks yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Start completing tasks to build streaks 🔥
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2} pb={4}>
      {streakTasks.map((task, idx) => {
        const days = task.streak!.current;
        const tier = getTier(days);
        const colors = getTierColor(tier);
        const target = getNextTarget(days);
        const progress = Math.min((days / target) * 100, 100);

        return (
          <Paper
            key={task.id}
            sx={{
              p: 2.5,
              background: colors.bg,
              border: `1.5px solid ${colors.primary}20`,
              borderRadius: 1.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: `${colors.primary}40`,
                boxShadow: `0 4px 12px ${colors.primary}15`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LocalFireDepartmentIcon sx={{ color: colors.primary, fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {task.title}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {task.type === 'repeat' ? `Every ${task.repeatEveryDays}d` : 'One-time'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right', pl: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                  {days}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  {tier}
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  Progress to {target} days
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.primary, fontSize: '0.75rem' }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary}15`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: colors.primary,
                    borderRadius: 2
                  }
                }}
              />
            </Box>

            {/* Info */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={tier}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: colors.primary,
                  color: tier === 'Legend' ? '#000' : '#fff'
                }}
              />
              <Chip
                label={`${days} days 🔥`}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              />
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
