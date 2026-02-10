import {
  Box,
  Stack,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  LinearProgress
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import { Task, Group } from "../../types/todoModels";
import { getDaysDiff, getRepeatDiff } from "../../engine/taskPriorityEngine";

interface Props {
  tasks: Task[];
  groups: Group[];
  onViewAll?: () => void;
}

export default function PendingTasksSummary({
  tasks,
  groups,
  onViewAll
}: Props) {
  const navigate = useNavigate();
  const now = new Date();

  // Filter pending tasks
  const pending = tasks.filter(t => t.status === "pending");
  const completed = tasks.filter(t => t.status === "completed").length;

  // Group pending tasks by category
  const overdue = pending.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < now;
  });

  const dueTodayOrOverdue = pending.filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) || new Date(t.deadline) < now;
  });

  const upcomingWeek = pending
    .filter(t => {
      if (!t.deadline) return false;
      const diff = getDaysDiff(t.deadline);
      return diff > 0 && diff <= 7;
    })
    .sort(
      (a, b) =>
        getDaysDiff(a.deadline!) - getDaysDiff(b.deadline!)
    );

  const repeatingPending = pending.filter(t => t.type === "repeat");

  const groupMap = new Map(groups.map(g => [g.id, g.name]));

  const getGroupName = (task: Task): string => {
    if (task.groupIds.length === 0) return "General";
    return task.groupIds.map(id => groupMap.get(id) || "Unknown").join(", ");
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return "#EF5350";
    if (priority >= 4) return "#FFA726";
    if (priority >= 3) return "#42A5F5";
    if (priority >= 2) return "#66BB6A";
    return "#90A4AE";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return "Critical";
    if (priority >= 4) return "High";
    if (priority >= 3) return "Focused";
    if (priority >= 2) return "Normal";
    return "Low";
  };

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <Stack spacing={3} pb={4}>
      {/* Header with Stats */}
      <Paper sx={{ p: 3, backgroundColor: "rgba(66, 165, 245, 0.08)" }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Tasks Overview
            </Typography>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {pending.length} pending · {completed} completed
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                {completionRate}% Complete
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Overdue / Due Today Section */}
      {dueTodayOrOverdue.length > 0 && (
        <Paper sx={{ p: 2.5, borderLeft: "4px solid #EF5350" }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ErrorIcon sx={{ color: "#EF5350", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#EF5350" }}>
                {overdue.length > 0 ? "⚡ OVERDUE" : "📅 TODAY"} ({dueTodayOrOverdue.length})
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={1}>
              {dueTodayOrOverdue.slice(0, 5).map(task => (
                <Box
                  key={task.id}
                  sx={{
                    p: 1.5,
                    backgroundColor: "rgba(239, 83, 80, 0.06)",
                    borderRadius: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(239, 83, 80, 0.12)"
                    }
                  }}
                  onClick={() => navigate("/todo")}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                        <Chip
                          label={getGroupName(task)}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                        <Chip
                          label={getPriorityLabel(task.priority)}
                          size="small"
                          sx={{
                            height: 20,
                            backgroundColor: getPriorityColor(task.priority),
                            color: "white"
                          }}
                        />
                      </Box>
                    </Box>
                    {task.deadline && (
                      <Typography variant="caption" sx={{ color: "#EF5350", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {overdue.includes(task) ? "OVERDUE" : "TODAY"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Upcoming This Week */}
      {upcomingWeek.length > 0 && (
        <Paper sx={{ p: 2.5, borderLeft: "4px solid #42A5F5" }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ color: "#42A5F5", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                📅 This Week ({upcomingWeek.length})
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={1}>
              {upcomingWeek.slice(0, 4).map(task => {
                const daysLeft = getDaysDiff(task.deadline!);
                return (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1.5,
                      backgroundColor: "rgba(66, 165, 245, 0.06)",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(66, 165, 245, 0.12)"
                      }
                    }}
                    onClick={() => navigate("/todo")}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                          <Chip
                            label={getGroupName(task)}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                          <Chip
                            label={getPriorityLabel(task.priority)}
                            size="small"
                            sx={{
                              height: 20,
                              backgroundColor: getPriorityColor(task.priority),
                              color: "white"
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                        {daysLeft === 1 ? "Tomorrow" : `${daysLeft} days`}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Repeating Tasks */}
      {repeatingPending.length > 0 && (
        <Paper sx={{ p: 2.5, borderLeft: "4px solid #66BB6A" }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon sx={{ color: "#66BB6A", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                🔄 Repeating Tasks ({repeatingPending.length})
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={1}>
              {repeatingPending.slice(0, 4).map(task => {
                const daysLeft = getRepeatDiff(task);
                return (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1.5,
                      backgroundColor: "rgba(102, 187, 106, 0.06)",
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(102, 187, 106, 0.12)"
                      }
                    }}
                    onClick={() => navigate("/todo")}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                          <Chip
                            label={getGroupName(task)}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                          <Chip
                            label={`Every ${task.repeatEveryDays}d`}
                            size="small"
                            sx={{
                              height: 20,
                              backgroundColor: "#66BB6A",
                              color: "white"
                            }}
                          />
                        </Box>
                      </Box>
                      {task.streak && (
                        <Typography variant="caption" sx={{ color: "#66BB6A", fontWeight: 600, whiteSpace: "nowrap" }}>
                          🔥 {task.streak.current}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Empty State */}
      {pending.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            ✨ All tasks completed! Great job staying on track.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/todo")}
          >
            View Task Planner
          </Button>
        </Paper>
      )}

      {/* View All Button */}
      {(dueTodayOrOverdue.length > 5 ||
        upcomingWeek.length > 4 ||
        repeatingPending.length > 4) && (
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="text"
            onClick={() => navigate("/todo")}
            sx={{ textTransform: "none" }}
          >
            View All Tasks →
          </Button>
        </Box>
      )}
    </Stack>
  );
}
