import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Button,
  Typography,
  Chip,
  Box
} from "@mui/material";

import {
  DatePicker,
  TimePicker
} from "@mui/x-date-pickers";

import {
  LocalizationProvider
} from "@mui/x-date-pickers/LocalizationProvider";

import {
  AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { useState, useEffect } from "react";

import {
  Routine,
  Todo,
  Group,
  Priority
} from "../../types/todoModels";

interface Props {
  open: boolean;
  mode: "routine" | "todo";
  item: Routine | Todo | null;
  groups: Group[];
  onClose: () => void;
  onSave: (item: any) => void;
}

export default function TaskEditorModal({
  open, mode, item, groups, onClose, onSave
}: Props) {

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<any>(null);
  const [time, setTime] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {

    setTitle(item?.title ?? "");
    setPriority((item as any)?.priority ?? "medium");
    setGroupIds((item as any)?.groupIds ?? []);

    if (mode === "todo" && (item as Todo)?.deadline) {
      setDeadline(dayjs((item as Todo).deadline));
    } else {
      setDeadline(null);
    }

    if (mode === "routine" && (item as Routine)?.completeByTime) {
      setTime(dayjs(`2020-01-01T${(item as Routine).completeByTime}`));
    } else {
      setTime(null);
    }

  }, [item, mode]);

  const toggleGroup = (id: string) => {
    setGroupIds(prev =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {

    if (!title.trim()) {
      setError("Title required");
      return;
    }

    if (mode === "todo" && !deadline) {
      setError("Deadline required");
      return;
    }

    if (mode === "routine" && !time) {
      setError("Time required");
      return;
    }

    setError("");

    if (mode === "routine") {
      onSave({
        id: item?.id ?? crypto.randomUUID(),
        title,
        priority,
        groupIds,
        repeatEveryDays: 1,
        completeByTime: time.format("hh:mm A"),
        trackStreak: true,
        streak: (item as Routine)?.streak ?? { current: 0, longest: 0 },
        completedToday: (item as Routine)?.completedToday ?? null
      });
    } else {
      onSave({
        id: item?.id ?? crypto.randomUUID(),
        title,
        priority,
        groupIds,
        deadline: deadline.format("YYYY-MM-DD"),
        createdAt: (item as Todo)?.createdAt ?? new Date().toISOString(),
        completedAt: (item as Todo)?.completedAt ?? null,
        status: (item as Todo)?.status ?? "pending"
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            backdropFilter: "blur(20px)"
          }
        }}
      >

        <DialogTitle sx={{ fontWeight: 700 }}>
          {mode === "routine" ? "Edit Routine" : "Edit Todo"}
        </DialogTitle>

        <DialogContent>

          <Stack spacing={2} mt={1}>

            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <TextField
              select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </TextField>

            <Typography variant="caption">Groups</Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {groups.map(g => (
                <Chip
                  key={g.id}
                  label={g.name}
                  onClick={() => toggleGroup(g.id)}
                  color={groupIds.includes(g.id) ? "primary" : "default"}
                />
              ))}
            </Box>

            {mode === "routine" && (
              <TimePicker
                ampm
                label="Complete by"
                value={time}
                onChange={setTime}
                minutesStep={1}          // ⭐ allows every minute
              />

            )}

            {mode === "todo" && (
              <DatePicker label="Deadline" value={deadline} onChange={setDeadline} />
            )}

            {error && <Typography color="error">{error}</Typography>}

            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" onClick={onClose}>
                Cancel
              </Button>

              <Button fullWidth variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Stack>

          </Stack>

        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}
