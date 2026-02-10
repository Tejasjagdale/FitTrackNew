import {
  Box,
  Stack,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  Card,
  CardContent,
  CardActionArea
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import { Task, Group } from "../../types/todoModels";
import { getDaysDiff, getRepeatDiff } from "../../engine/taskPriorityEngine";

interface Props {
  tasks: Task[];
  groups: Group[];
  onSelectTask?: (task: Task) => void;
}

export default function TodaysPriority({
  tasks,
  groups,
  onSelectTask
}: Props) {
  const navigate = useNavigate();
  const now = new Date();

  // Get pending tasks
  const pending = tasks.filter(t => t.status === "pending");

  // Today's focus: high priority + today's deadlines + daily repeats
  const highPriorityTasks = pending.filter(t => t.priority >= 4);

  const todayDeadlines = pending.filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const dailyRepeating = pending.filter(
    t => t.type === "repeat" && t.repeatEveryDays === 1
  );

  // Combine and sort by priority
  const todaysFocus = Array.from(
    new Map(
      [
        ...highPriorityTasks,
        ...todayDeadlines,
        ...dailyRepeating
      ]
        .sort((a, b) => b.priority - a.priority)
        .map(t => [t.id, t])
    ).values()
  ).slice(0, 6);

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
    if (priority >= 5) return "🔴 Critical";
    if (priority >= 4) return "🟠 High";
    if (priority >= 3) return "🔵 Focused";
    if (priority >= 2) return "🟢 Normal";
    return "⚪ Low";
  };

  const getTaskStatus = (task: Task): string => {
    if (task.type === "deadline" && task.deadline) {
      const daysLeft = getDaysDiff(task.deadline);
      if (daysLeft < 0) return "OVERDUE";
      if (daysLeft === 0) return "TODAY";
      if (daysLeft === 1) return "TOMORROW";
      return `${daysLeft}d left`;
    }

    if (task.type === "repeat") {
      const daysLeft = getRepeatDiff(task);
      if (daysLeft <= 0) return "DUE TODAY";
      return `${daysLeft}d to next`;
    }

    return "Open";
  };

  const getStatusColor = (task: Task): string => {
    if (task.type === "deadline" && task.deadline) {
      const daysLeft = getDaysDiff(task.deadline);
      if (daysLeft < 0) return "#EF5350";
      if (daysLeft === 0) return "#FFA726";
      if (daysLeft <= 3) return "#FFB74D";
      return "#66BB6A";
    }
    return "#90A4AE";
  };

  return (
    <Stack spacing={3} pb={4}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <LocalFireDepartmentIcon sx={{ fontSize: 28, color: "#FFA726" }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Today's Priority
        </Typography>
      </Box>

      {todaysFocus.length > 0 ? (
        <Stack spacing={1.5}>
          {todaysFocus.map((task, index) => (
            <Card
              key={task.id}
              sx={{
                borderRadius: 2,
                backgroundColor:
                  index === 0
                    ? "rgba(255, 167, 38, 0.06)"
                    : "rgba(255, 255, 255, 0.03)",
                borderLeft: `5px solid ${getPriorityColor(task.priority)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateX(4px)",
                  backgroundColor:
                    index === 0
                      ? "rgba(255, 167, 38, 0.12)"
                      : "rgba(255, 255, 255, 0.06)"
                }
              }}
            >
              <CardActionArea
                onClick={() => {
                  navigate("/todo");
                  onSelectTask?.(task);
                }}
              >
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      {/* Task Title with Rank */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        {index === 0 && (
                          <StarIcon
                            sx={{
                              fontSize: 18,
                              color: "#FFD700"
                            }}
                          />
                        )}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            fontSize: index === 0 ? "0.95rem" : "0.9rem"
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Box>

                      {/* Metadata Chips */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          flexWrap: "wrap",
                          mt: 1
                        }}
                      >
                        <Chip
                          label={getGroupName(task)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: "0.75rem"
                          }}
                        />
                        <Chip
                          label={getPriorityLabel(task.priority)}
                          size="small"
                          sx={{
                            height: 22,
                            backgroundColor: getPriorityColor(task.priority),
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}
                        />
                        {task.streak && task.streak.current > 0 && (
                          <Chip
                            label={`🔥 ${task.streak.current}`}
                            size="small"
                            sx={{
                              height: 22,
                              backgroundColor: "rgba(255, 152, 0, 0.2)",
                              color: "#FF9800",
                              fontSize: "0.75rem",
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Status Badge */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.5,
                        minWidth: "max-content"
                      }}
                    >
                      <Chip
                        label={getTaskStatus(task)}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: getStatusColor(task),
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.7rem"
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "rgba(102, 187, 106, 0.06)" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            ✨ No priority tasks for today. You're all set!
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/todo")}
          >
            View All Tasks
          </Button>
        </Paper>
      )}

      {/* Quick Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5
        }}
      >
        <Paper
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "rgba(66, 165, 245, 0.08)"
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#42A5F5" }}>
            {highPriorityTasks.length}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            High Priority
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 2,
            textAlign: "center",
            backgroundColor: "rgba(255, 167, 38, 0.08)"
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#FFA726" }}>
            {todayDeadlines.length}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Due Today
          </Typography>
        </Paper>
      </Box>

      {/* CTA */}
      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/todo")}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "0.95rem"
        }}
      >
        Open Task Planner
      </Button>
    </Stack>
  );
}
