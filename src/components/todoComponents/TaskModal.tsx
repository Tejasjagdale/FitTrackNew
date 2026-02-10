import {
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Typography
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useState } from "react";

import { Task, Group } from "../../types/todoModels";

interface Props {
  open: boolean;
  task?: Task | null;
  groups: Group[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskModal({
  open,
  task,
  groups,
  onClose,
  onSave,
  onDelete
}: Props) {
  /* ================= STATE ================= */

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(3);
  const [status, setStatus] = useState<
    "pending" | "completed" | "on_hold"
  >("pending");

  const [groupIds, setGroupIds] = useState<string[]>([]);

  const [type, setType] = useState<"repeat" | "deadline">("repeat");

  const [deadline, setDeadline] = useState("");

  const [repeatDays, setRepeatDays] = useState(1);

  const [trackStreak, setTrackStreak] = useState(true);

  /* ================= LOAD EDIT DATA ================= */

  useEffect(() => {
    if (!task) {
      setTitle("");
      setPriority(3);
      setGroupIds([]);
      setType("repeat");
      setDeadline("");
      setRepeatDays(1);
      setTrackStreak(true);
      return;
    }

    setTitle(task.title);
    setPriority(task.priority);
    setStatus(task.status);

    setGroupIds(
      Array.isArray(task.groupIds) ? task.groupIds : []
    );

    setType(task.type);

    setDeadline(task.deadline || "");

    setRepeatDays(task.repeatEveryDays || 1);

    setTrackStreak(task.trackStreak);
  }, [task]);

  /* ================= SAVE ================= */

  const save = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: task?.id || crypto.randomUUID(),
      createdAt: task?.createdAt || new Date().toISOString(),

      title,
      priority,
      groupIds,

      type,

      deadline: type === "deadline" ? deadline : null,

      repeatEveryDays: type === "repeat" ? repeatDays : null,

      trackStreak,

      streak:
        type === "repeat" && trackStreak
          ? task?.streak || { current: 0, longest: 0 }
          : null,

      lastCompleted: task?.lastCompleted || null,

      // ensure createdAt exists for type

      status: status
    };

    onSave(newTask);
  };

  /* ================= RENDER ================= */

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backdropFilter: "blur(10px)"
        }
      }}
    >
      <DialogContent
        sx={{
          minHeight: "auto",
          maxHeight: "90vh",
          overflowY: "auto",
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", sm: "auto" }
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6">
            {task ? "Edit Task" : "New Task"}
          </Typography>

          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Priority */}
          <TextField
            type="number"
            label="Priority (1–5)"
            inputProps={{ min: 1, max: 5 }}
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
          />

          {/* Groups */}
          <Select
            multiple
            value={groupIds}
            onChange={e => {
              const value = e.target.value;

              setGroupIds(
                typeof value === "string"
                  ? value.split(",")
                  : value
              );
            }}
            renderValue={selected => (
              <Stack direction="row" spacing={1}>
                {(selected as string[]).map(id => (
                  <Chip
                    key={id}
                    size="small"
                    label={
                      groups.find(g => g.id === id)?.name
                    }
                  />
                ))}
              </Stack>
            )}
          >
            {groups.map(g => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>

          {/* Type */}
          <Select
            value={type}
            onChange={e =>
              setType(e.target.value as any)
            }
          >
            <MenuItem value="repeat">Repeat</MenuItem>
            <MenuItem value="deadline">Deadline</MenuItem>
          </Select>

          <Select
            value={status}
            onChange={e =>
              setStatus(e.target.value as any)
            }
          >
            <MenuItem value="pending">Active</MenuItem>
            <MenuItem value="on_hold">On Hold</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>

          {/* Repeat */}
          {type === "repeat" && (
            <TextField
              type="number"
              label="Repeat every (days)"
              inputProps={{ min: 1 }}
              value={repeatDays}
              onChange={e =>
                setRepeatDays(Number(e.target.value))
              }
            />
          )}

          {/* Deadline */}
          {type === "deadline" && (
            <TextField
              type="date"
              label="Deadline"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}

          {/* Streak */}
          {type === "repeat" && (
            <FormControlLabel
              control={
                <Switch
                  checked={trackStreak}
                  onChange={e =>
                    setTrackStreak(e.target.checked)
                  }
                />
              }
              label="Track Streak"
            />
          )}

          {/* Delete */}
          {task && onDelete && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                onDelete?.(task.id);
              }}
            >
              Delete Task
            </Button>
          )}

          {/* Save */}
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
