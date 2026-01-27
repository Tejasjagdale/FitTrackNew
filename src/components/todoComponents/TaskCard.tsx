import {
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Chip,
  Box,
  Checkbox
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import { Task } from "../../types/todoModels";

import {
  getDaysDiff,
  getRepeatDiff
} from "../../engine/taskPriorityEngine";

/* ================= PRIORITY META ================= */

const priorityMeta: Record<
  number,
  { label: string; color: string }
> = {
  1: { label: "Low", color: "#90A4AE" },
  2: { label: "Normal", color: "#66BB6A" },
  3: { label: "Focused", color: "#42A5F5" },
  4: { label: "High", color: "#FFA726" },
  5: { label: "Critical", color: "#EF5350" }
};

/* ================= COMPONENT ================= */

interface Props {
  task: Task;
  onComplete: () => void;
  onEdit: () => void;
}

export default function TaskCard({
  task,
  onComplete,
  onEdit
}: Props) {

  const meta =
    priorityMeta[task.priority] ||
    priorityMeta[3];

  /* ================= TIME STATUS ================= */

  let daysLeft: number | null = null;

  if (task.type === "deadline" && task.deadline) {
    daysLeft = getDaysDiff(task.deadline);
  }

  if (task.type === "repeat") {
    daysLeft = getRepeatDiff(task);
  }

  const isOverdue =
    task.type === "deadline" &&
    daysLeft !== null &&
    daysLeft < 0;

  const isToday = daysLeft === 0;

  const isTomorrow = daysLeft === 1;

  const isDaily =
    task.type === "repeat" &&
    task.repeatEveryDays === 1;


  /* ================= VISUAL MODE ================= */

  let border = "rgba(255,255,255,0.06)";
  let shadow = "none";
  let animation = "none";

  /* 🚨 OVERDUE = EMERGENCY */
  if (isOverdue) {
    border = "#f44336";
    shadow = "0 0 18px rgba(244,67,54,.8)";
    animation = "alarm 0.5s infinite";
  }

  /* ⚠️ DUE / MISSED = IMPORTANT */
  else if (isToday && !isDaily) {
    border = "#ff9800";
    shadow = "0 0 14px rgba(255,152,0,.6)";
    animation = "pulse 2.5s ease-in-out infinite";
  }

  /* ⏳ TOMORROW = WARNING */
  else if (isTomorrow) {
    border = "rgba(255,152,0,.5)";
    shadow = "0 0 10px rgba(255,152,0,.3)";
  }


  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",

        borderRadius: 2,

        background:
          "linear-gradient(135deg,#0f172a,#020617)",

        border: `1px solid ${border}`,

        boxShadow: shadow,

        animation,

        transition: "all .25s ease",

        /* Emergency heartbeat */
        "@keyframes alarm": {
          "0%": {
            transform: "scale(1)",
            boxShadow: shadow
          },
          "50%": {
            transform: "scale(1.015)",
            boxShadow:
              "0 0 28px rgba(244,67,54,1)"
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: shadow
          }
        },

        /* Soft attention pulse */
        "@keyframes pulse": {
          "0%": {
            boxShadow: shadow
          },
          "50%": {
            boxShadow:
              "0 0 22px rgba(255,152,0,.8)"
          },
          "100%": {
            boxShadow: shadow
          }
        },

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 10px 24px rgba(0,0,0,.4)"
        }
      }}
    >
      <CardContent
        sx={{
          py: 1,
          px: 1.5,
          "&:last-child": { pb: 1 }
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
        >

          {/* Checkbox */}
          <Checkbox
            checked={task.status === "completed"}
            onChange={onComplete}
            sx={{
              p: 0.3,
              color: meta.color,

              "&.Mui-checked": {
                color: "#4CAF50"
              }
            }}
          />


          {/* Main */}
          <Box flex={1} minWidth={0}>

            <Stack
              direction="row"
              spacing={0.6}
              flexWrap="wrap"
              alignItems="center"
            >

              {/* Title */}
              <Typography
                sx={{
                  flexGrow: 1,
                  minWidth: 120,

                  fontSize: "0.9rem",

                  fontWeight:
                    task.priority >= 4 ? 700 : 600,

                  color: "#fff",

                  textDecoration:
                    task.status === "completed"
                      ? "line-through"
                      : "none",

                  opacity:
                    task.status === "completed"
                      ? 0.6
                      : 1,

                  lineHeight: 1.3,
                  wordBreak: "break-word"
                }}
              >
                {task.title}
              </Typography>


              {/* Priority */}
              <Chip
                size="small"
                label={meta.label}
                sx={{
                  height: 18,
                  fontSize: "0.6rem",

                  background: meta.color,

                  color: "#000",
                  fontWeight: 700
                }}
              />


              {/* Deadline */}
              {task.type === "deadline" &&
                daysLeft !== null && (
                  <Chip
                    size="small"
                    label={
                      daysLeft < 0
                        ? "Overdue"
                        : daysLeft === 0
                        ? "Today"
                        : daysLeft === 1
                        ? "Tomorrow"
                        : `${daysLeft}d`
                    }
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",

                      background:
                        isOverdue
                          ? "rgba(244,67,54,.25)"
                          : isToday || isTomorrow
                          ? "rgba(255,152,0,.25)"
                          : "rgba(255,255,255,.08)",

                      color:
                        isOverdue
                          ? "#f44336"
                          : isToday || isTomorrow
                          ? "#ff9800"
                          : "#eee"
                    }}
                  />
                )}


              {/* Repeat (NON-daily only) */}
              {task.type === "repeat" &&
                !isDaily &&
                daysLeft !== null && (
                  <Chip
                    size="small"
                    label={
                      daysLeft <= 0
                        ? "Missed"
                        : `In ${daysLeft}d`
                    }
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",

                      background:
                        daysLeft <= 0
                          ? "rgba(255,152,0,.2)"
                          : "rgba(255,255,255,.08)",

                      color:
                        daysLeft <= 0
                          ? "#ff9800"
                          : "#eee"
                    }}
                  />
                )}


              {/* Streak */}
              {task.trackStreak && task.streak && (
                <Chip
                  size="small"
                  label={`🔥 ${task.streak.current}`}
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",

                    background:
                      "rgba(76,175,80,.15)",

                    color: "#4CAF50"
                  }}
                />
              )}

            </Stack>
          </Box>


          {/* Edit */}
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              p: 0.3,
              color: "#bbb"
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

        </Stack>
      </CardContent>
    </Card>
  );
}
