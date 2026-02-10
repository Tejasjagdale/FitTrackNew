import {
  Box,
  Stack,
  Paper,
  Typography,
  Chip,
  Checkbox,
  LinearProgress
} from "@mui/material";

import { Task, Group } from "../../types/todoModels";
import { getDaysDiff, getRepeatDiff } from "../../engine/taskPriorityEngine";


interface Props {
  tasks: Task[];
  groups?: Group[];
  onSelectTask: (task: Task) => void;
  onComplete?: (task: Task) => void;
  showSummary?: boolean;
}

/* Priority colors - professional palette */
const priorityColors: Record<number, { bg: string; border: string; text: string }> = {
  5: { bg: 'rgba(211, 47, 47, 0.08)', border: '#d32f2f', text: '#d32f2f' },
  4: { bg: 'rgba(230, 124, 115, 0.08)', border: '#e67c73', text: '#e67c73' },
  3: { bg: 'rgba(255, 152, 0, 0.08)', border: '#ff9800', text: '#ff9800' },
  2: { bg: 'rgba(66, 133, 244, 0.08)', border: '#4285f4', text: '#4285f4' },
  1: { bg: 'rgba(52, 168, 224, 0.08)', border: '#34a8e0', text: '#34a8e0' },
};

const priorityLabels: Record<number, string> = {
  5: 'Critical',
  4: 'High',
  3: 'Medium',
  2: 'Low',
  1: 'Minimal',
};

/* Helper to determine if task is overdue */
const isOverdueTask = (task: Task): boolean => {
  if (task.status !== 'pending') return false;
  
  // Deadline overdue
  if (task.type === 'deadline' && task.deadline) {
    return getDaysDiff(task.deadline) < 0;
  }
  
  // Repeat overdue: non-daily task that's due or overdue
  if (task.type === 'repeat' && task.repeatEveryDays && task.repeatEveryDays > 1) {
    return getRepeatDiff(task) <= 0;
  }
  
  return false;
};

export default function HomeDashboard({
  tasks,
  groups = [],
  onSelectTask,
  onComplete
}: Props) {

  const now = new Date();
  const pending = tasks.filter(t => t.status === "pending");

  // Sort by priority (using new engine)
  const sortedTasks = [...pending].sort((a, b) => {
    // Overdue first (both)
    const aOverdue = isOverdueTask(a);
    const bOverdue = isOverdueTask(b);
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Then by deadline if both have one
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    
    // Then by priority
    if (b.priority !== a.priority) return b.priority - a.priority;
    
    // Then by name
    return a.title.localeCompare(b.title);
  });

  const completed = tasks.filter(t => t.status === "completed").length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  // Get group name by id
  const getGroupName = (groupId: string) => {
    return groups?.find(g => g.id === groupId)?.name || '';
  };

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < now;
  };

  // Check if task is due today
  const isDueToday = (task: Task) => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    return deadlineDate.toDateString() === now.toDateString();
  };

  /* ================= RENDER ================= */

  return (
    <Stack spacing={2.5} pb={4}>

      {/* Tasks List */}
      {pending.length > 0 ? (
        <Stack spacing={1.5}>
          {sortedTasks.map((task) => {
            const priorityColor = priorityColors[task.priority] || priorityColors[3];
            const taskGroups = groups?.filter(g => task.groupIds?.includes(g.id)) || [];
            
            return (
              <Paper
                key={task.id}
                sx={{
                  p: 1.75,
                  background: isOverdueTask(task) 
                    ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.12) 0%, rgba(229, 57, 53, 0.08) 100%)'
                    : 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: `1.5px solid ${isOverdueTask(task) ? '#d32f2f' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: 1.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  animation: isOverdueTask(task) ? 'blink 1.5s infinite' : 'none',
                  '@keyframes blink': {
                    '0%, 100%': {
                      boxShadow: '0 0 12px rgba(211, 47, 47, 0.3)'
                    },
                    '50%': {
                      boxShadow: '0 0 20px rgba(211, 47, 47, 0.6)'
                    }
                  },
                  '&:hover': {
                    borderColor: isOverdueTask(task) ? '#d32f2f' : 'rgba(0, 0, 0, 0.15)',
                    boxShadow: `0 4px 12px ${isOverdueTask(task) ? 'rgba(211, 47, 47, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
                    transform: 'translateY(-2px)',
                    background: isOverdueTask(task) ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.12) 0%, rgba(229, 57, 53, 0.08) 100%)' : 'rgba(245, 245, 245, 0.7)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  {/* Checkbox */}
                  <Checkbox
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete?.(task);
                    }}
                    sx={{
                      p: 0.5,
                      color: isOverdueTask(task) ? '#d32f2f' : priorityColor.text,
                      '&.Mui-checked': {
                        color: isOverdueTask(task) ? '#d32f2f' : priorityColor.text
                      }
                    }}
                  />

                  {/* Task Content */}
                  <Box sx={{ flex: 1 }} onClick={() => onSelectTask(task)}>
                    {/* Title */}
                    <Box sx={{ mb: 0.75 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        {task.title}
                      </Typography>
                    </Box>

                    {/* Metadata Tags */}
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Overdue Badge - Show first if overdue */}
                      {isOverdueTask(task) && (
                        <Chip
                          label="OVERDUE"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#d32f2f',
                            color: '#fff',
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      )}

                      {/* Type Badge */}
                      {task.type === 'repeat' && (
                        <Chip
                          label={`Every ${task.repeatEveryDays}d`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'text.secondary'
                          }}
                        />
                      )}

                      {/* Deadline Badge - Skip if already showing OVERDUE */}
                      {task.deadline && !isOverdueTask(task) && (
                        <Chip
                          label={
                            isDueToday(task) 
                              ? 'Today' 
                              : getDaysDiff(task.deadline) + ' days'
                          }
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: isDueToday(task) ? '#ff9800' : '#4285f4',
                            color: '#fff'
                          }}
                        />
                      )}
                      {/* Show Overdue in deadline chip if overdue but not from deadline (repeat task) */}
                      {task.deadline && isOverdueTask(task) && task.type === 'repeat' && (
                        <Chip
                          label="Due now"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#ff5252',
                            color: '#fff'
                          }}
                        />
                      )}

                      {/* Group Tags */}
                      {taskGroups.map(group => (
                        <Chip
                          key={group.id}
                          label={group.name}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        />
                      ))}

                      {/* Streak Badge */}
                      {task.streak && task.streak.current > 0 && (
                        <Chip
                          label={`${task.streak.current}🔥`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(255, 152, 0, 0.15)',
                            color: '#ff9800',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
            border: '1px dashed rgba(76, 175, 80, 0.2)',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            ✓ All caught up!
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No pending tasks. Great job!
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
