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
import WarningIcon from "@mui/icons-material/Warning";

import { Task } from "../../types/todoModels";

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

/* ================= HELPERS ================= */

function daysUntil(date: string) {
  const d = new Date(date);
  const now = new Date();

  return Math.ceil(
    (d.getTime() - now.getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

function isAfter9PM() {
  return new Date().getHours() >= 21;
}

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

  /* ================= URGENCY LOGIC ================= */

  const deadlineCritical =
    task.type === "deadline" &&
    task.deadline &&
    daysUntil(task.deadline) === 1 &&
    task.status === "pending";

  const dailyLate =
    task.type === "repeat" &&
    task.repeatEveryDays === 1 &&
    task.status === "pending" &&
    isAfter9PM();

  const overdue =
    task.type === "deadline" &&
    task.deadline &&
    daysUntil(task.deadline) < 0 &&
    task.status === "pending";

  const shouldBlink =
    overdue || deadlineCritical || dailyLate;


  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        background:
          "linear-gradient(135deg, rgba(18,22,28,.9), rgba(28,32,38,.9))",

        backdropFilter: "blur(10px)",

        border: "1px solid rgba(255,255,255,0.05)",

        transition: "all .2s ease",
        
        ...(overdue && {
          animation: "blink .6s infinite",
          boxShadow: "0 0 0 3px rgba(244,67,54,.9)"
        }),


        ...(shouldBlink && {
          animation: "blink 1.2s infinite",
          boxShadow:
            "0 0 0 2px rgba(255,82,82,.7)"
        }),

        "@keyframes blink": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.65 },
          "100%": { opacity: 1 }
        },

        "&:hover": {
          boxShadow:
            "0 6px 20px rgba(0,0,0,.35)"
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

          {/* Main Content */}
          <Box flex={1} minWidth={0}>
            {/* Title + Chips Row */}
            <Stack
              direction="row"
              spacing={0.6}
              flexWrap="wrap"
              alignItems="center"
            >
              {/* Title */}
              <Typography
                noWrap={false}
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

              {/* Repeat */}
              {task.type === "repeat" && (
                <Chip
                  size="small"
                  label={`Every ${task.repeatEveryDays}d`}
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",

                    background:
                      "rgba(255,255,255,.08)",

                    color: "#eee"
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

              {/* Deadline Warning */}
              {deadlineCritical && (
                <Chip
                  size="small"
                  icon={<WarningIcon />}
                  label="Due Tomorrow"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",

                    background:
                      "rgba(255,152,0,.2)",

                    color: "#ff9800"
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
