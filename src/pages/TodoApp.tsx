import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Button,
  Stack,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  Divider,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

/* ================= TYPES ================= */

type View = "TASKS" | "GROUPS" | "COMPLETED";
type Priority = "NORMAL" | "MEDIUM" | "HIGH";

interface Group {
  id: string;
  name: string;
  type: "USER" | "SYSTEM";
  locked?: boolean;
}

interface Task {
  id: string;
  title: string;
  groupId: string;
  originalGroupId?: string;
  dueDate?: string;
  priority: Priority;
}

/* ================= CONSTANTS ================= */

const GROUP_COMPLETED = "completed";

const priorityBorder:any = {
  NORMAL: "#1976d2",
  MEDIUM: "#ed6c02",
  HIGH: "#d32f2f"
};

/* ================= DATA ================= */

const initialGroups: Group[] = [
  { id: "daily", name: "Daily Activity", type: "USER" },
  { id: "important", name: "Important", type: "USER" },
  { id: GROUP_COMPLETED, name: "Completed Tasks", type: "SYSTEM", locked: true }
];

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Finish system design prep",
    groupId: "important",
    priority: "HIGH",
    dueDate: "2025-12-30T23:59"
  },
  {
    id: "t2",
    title: "Workout",
    groupId: "daily",
    priority: "MEDIUM"
  }
];

/* ================= APP ================= */

const TodoApp: React.FC = () => {
  const [view, setView] = useState<View>("TASKS");
  const [groups] = useState<Group[]>(initialGroups);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [forcedGroupId, setForcedGroupId] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => t.groupId !== GROUP_COMPLETED);
  const completedTasks = tasks.filter(t => t.groupId === GROUP_COMPLETED);

  /* ================= ACTIONS ================= */

  const toggleComplete = (task: Task) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== task.id) return t;
        if (t.groupId === GROUP_COMPLETED) {
          return {
            ...t,
            groupId: t.originalGroupId!,
            originalGroupId: undefined
          };
        }
        return {
          ...t,
          originalGroupId: t.groupId,
          groupId: GROUP_COMPLETED
        };
      })
    );
  };

  const saveTask = (task: Task) => {
    setTasks(prev =>
      prev.some(t => t.id === task.id)
        ? prev.map(t => (t.id === task.id ? task : t))
        : [...prev, task]
    );
    setModalOpen(false);
    setEditingTask(null);
    setForcedGroupId(null);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const groupName = (id: string) =>
    groups.find(g => g.id === id)?.name || "Unknown";

  /* ================= UI ================= */

  return (
    <Box sx={{ p: 2 }}>

      {/* ===== TOP BAR ===== */}
      <Stack direction="row" spacing={1} mb={2}>
        {view !== "TASKS" && (
          <Button startIcon={<ArrowBackIcon />} onClick={() => setView("TASKS")}>
            Back
          </Button>
        )}
        <Button startIcon={<FolderIcon />} onClick={() => setView("GROUPS")}>
          Groups
        </Button>
        <Button startIcon={<DoneAllIcon />} onClick={() => setView("COMPLETED")}>
          Completed
        </Button>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setEditingTask(null);
            setForcedGroupId(null);
            setModalOpen(true);
          }}
        >
          New Task
        </Button>
      </Stack>

      {/* ===== TASKS VIEW ===== */}
      {view === "TASKS" && (
        <Stack spacing={2}>
          {activeTasks.length === 0 && (
            <EmptyCard text="🎉 No pending tasks. You are done!" />
          )}
          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              groupName={groupName(task.groupId)}
              onToggle={() => toggleComplete(task)}
              onEdit={() => {
                setEditingTask(task);
                setForcedGroupId(task.groupId);
                setModalOpen(true);
              }}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </Stack>
      )}

      {/* ===== GROUPS VIEW ===== */}
      {view === "GROUPS" && (
        <Stack spacing={3}>
          {groups.filter(g => g.type === "USER").map(group => (
            <Card key={group.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={20} fontWeight={700}>
                    {group.name}
                  </Typography>
                  <IconButton
                    onClick={() => {
                      setEditingTask(null);
                      setForcedGroupId(group.id);
                      setModalOpen(true);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  {activeTasks
                    .filter(t => t.groupId === group.id)
                    .map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        groupName={group.name}
                        onToggle={() => toggleComplete(task)}
                        onEdit={() => {
                          setEditingTask(task);
                          setForcedGroupId(group.id);
                          setModalOpen(true);
                        }}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* ===== COMPLETED VIEW ===== */}
      {view === "COMPLETED" && (
        <Stack spacing={2}>
          {completedTasks.length === 0 && (
            <EmptyCard text="No tasks completed yet." />
          )}
          {completedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              groupName="Completed Tasks"
              onToggle={() => toggleComplete(task)}
              onEdit={() => {
                setEditingTask(task);
                setForcedGroupId(task.originalGroupId || "");
                setModalOpen(true);
              }}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </Stack>
      )}

      {/* ===== MODAL ===== */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        groups={groups}
        forcedGroupId={forcedGroupId}
        onClose={() => setModalOpen(false)}
        onSave={saveTask}
      />
    </Box>
  );
};

/* ================= COMPONENTS ================= */

const TaskCard = ({ task, groupName, onToggle, onEdit, onDelete }: any) => (
  <Card sx={{ borderLeft: `6px solid ${priorityBorder[task.priority]}` }}>
    <CardContent>
      <Stack direction="row" alignItems="center">
        <Checkbox checked={task.groupId === GROUP_COMPLETED} onChange={onToggle} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={600}>{task.title}</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip size="small" label={groupName} />
            <Chip
              size="small"
              label={task.dueDate ? dayjs(task.dueDate).format("DD MMM YYYY") : "No due date"}
            />
          </Stack>
        </Box>
        <IconButton onClick={onEdit}><EditIcon /></IconButton>
        <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
      </Stack>
    </CardContent>
  </Card>
);

const EmptyCard = ({ text }: { text: string }) => (
  <Card>
    <CardContent>
      <Typography align="center">{text}</Typography>
    </CardContent>
  </Card>
);

/* ================= MODAL ================= */

const TaskModal = ({ open, task, groups, forcedGroupId, onClose, onSave }: any) => {
  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState("daily");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    setTitle(task?.title || "");
    setGroupId(task?.groupId || forcedGroupId || "daily");
    setPriority(task?.priority || "NORMAL");
    setDueDate(task?.dueDate ? dayjs(task.dueDate) : null);
  }, [task, forcedGroupId]);

  const save = () => {
    onSave({
      id: task?.id || crypto.randomUUID(),
      title,
      groupId,
      priority,
      dueDate: dueDate?.toISOString(),
      originalGroupId: task?.originalGroupId
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ minWidth: 420 }}>
        <Stack spacing={2}>
          <TextField label="Task" value={title} onChange={e => setTitle(e.target.value)} />

          <Select value={groupId} onChange={e => setGroupId(e.target.value)}>
            {groups.filter((g:any) => g.type === "USER").map((g:any)=> (
              <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
            ))}
          </Select>

          <Stack direction="row" spacing={1}>
            {(["NORMAL", "MEDIUM", "HIGH"] as Priority[]).map(p => (
              <Chip
                key={p}
                label={p}
                clickable
                color={priority === p ? "primary" : "default"}
                onClick={() => setPriority(p)}
              />
            ))}
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Due date" value={dueDate} onChange={setDueDate} />
          </LocalizationProvider>

          <Button variant="contained" onClick={save}>Save</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TodoApp;
