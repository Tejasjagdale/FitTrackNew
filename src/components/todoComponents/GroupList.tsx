import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip
} from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

import { Group, Task } from "../../types/todoModels";

/* ================= GROUP COLOR PALETTE ================= */

const groupColors = [
  { primary: "#2196f3", bg: "rgba(33, 150, 243, 0.1)" },
  { primary: "#4caf50", bg: "rgba(76, 175, 80, 0.1)" },
  { primary: "#f44336", bg: "rgba(244, 67, 54, 0.1)" },
  { primary: "#ff9800", bg: "rgba(255, 152, 0, 0.1)" },
  { primary: "#9c27b0", bg: "rgba(156, 39, 176, 0.1)" },
  { primary: "#e91e63", bg: "rgba(233, 30, 99, 0.1)" }
];

function getGroupColor(idx: number) {
  return groupColors[idx % groupColors.length];
}

interface Props {
  groups: Group[];
  tasks: Task[];
  onSelect: (groupId: string) => void;
}

export default function GroupList({
  groups,
  tasks,
  onSelect
}: Props) {

  /* ================= METRICS ================= */

  const groupStats = groups.map((g, idx) => {
    const groupTasks = tasks.filter(t =>
      t.groupIds.includes(g.id)
    );

    const total = groupTasks.length;

    const completed = groupTasks.filter(
      t => t.status === "completed"
    ).length;

    return {
      ...g,
      idx,
      total,
      completed,
      pending: total - completed,
      progress: total ? Math.round((completed / total) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  /* ================= EMPTY ================= */

  if (!groups.length) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px dashed rgba(33, 150, 243, 0.2)',
          borderRadius: 2
        }}
      >
        <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          No groups yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Create a group to organize your tasks
        </Typography>
      </Paper>
    );
  }

  /* ================= RENDER ================= */

  return (
    <Stack spacing={2} pb={4}>
      {groupStats.map((group) => {
        const colors = getGroupColor(group.idx);

        return (
          <Paper
            key={group.id}
            onClick={() => onSelect(group.id)}
            sx={{
              p: 2.5,
              background: colors.bg,
              border: `2px solid ${colors.primary}`,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 100% -50%, ${colors.primary}10, transparent 70%)`,
                pointerEvents: 'none'
              },
              '&:hover': {
                borderColor: colors.primary,
                boxShadow: `0 8px 24px ${colors.primary}30`,
                transform: 'translateY(-4px)',
                background: colors.bg,
                '&::before': {
                  background: `radial-gradient(circle at 100% -50%, ${colors.primary}20, transparent 60%)`
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <FolderIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {group.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {group.total} {group.total === 1 ? 'task' : 'tasks'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right', pl: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                    {group.completed}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    completed
                  </Typography>
                </Box>
              </Box>

              {/* Progress Bar */}
              {group.total > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Completion
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.primary, fontSize: '0.75rem' }}>
                      {group.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={group.progress}
                    sx={{
                      height: 5,
                      borderRadius: 2,
                      backgroundColor: `${colors.primary}15`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors.primary,
                        borderRadius: 2,
                        boxShadow: `0 0 8px ${colors.primary}40`
                      }
                    }}
                  />
                </Box>
              )}

              {/* Info Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${group.completed} done`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#4caf5040',
                    color: '#2e7d32'
                  }}
                />
                <Chip
                  label={`${group.pending} pending`}
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
            </Box>
          </Paper>
        );
      })}
    </Stack>
  )
}
