import {
  Container,
  Box,
  Stack,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import SyncIcon from "@mui/icons-material/Sync";

import { useEffect, useState } from "react";

import {
  loadTodoData,
  getTodoData,
  setTodoData,
  syncTodoToGitHub
} from "../data/todoDataService";

import {
  Routine,
  Todo,
  Group,
  TodoStatus
} from "../types/todoModels";

import PremiumTaskCard from "../components/todoComponents/PremiumTaskCard";
import TaskEditorModal from "../components/todoComponents/TaskEditorModal";
import GroupModal from "../components/todoComponents/GroupModal";

/* ===== PRIORITY ENGINES ===== */
import { buildTodoPriorityLists } from "../engine/todoPriorityEngine";
import { buildRoutinePriorityLists } from "../engine/routinePriorityEngine";

export default function TodoApp() {

  const [loading, setLoading] = useState(true);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [tab, setTab] = useState(0);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"routine" | "todo">("todo");
  const [editingItem, setEditingItem] = useState<any>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  /* ================= LOAD ================= */

  useEffect(() => {
    async function load() {
      await loadTodoData();
      const db = getTodoData();
      setRoutines(db.routines);
      setTodos(db.todos);
      setGroups(db.groups);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {

    const interval = setInterval(() => {

      const today = new Date().toISOString().slice(0, 10);

      setRoutines(prev =>
        prev.map(r =>
          r.completedToday &&
            r.completedToday !== today
            ? { ...r, completedToday: null }
            : r
        )
      );

    }, 60000); // check every minute

    return () => clearInterval(interval);

  }, []);


  /* ================= SAVE ================= */

  const saveDb = (nextRoutines: Routine[], nextTodos: Todo[], nextGroups?: Group[]) => {

    const db = getTodoData();

    const updated = {
      ...db,
      routines: nextRoutines,
      todos: nextTodos,
      groups: nextGroups ?? db.groups
    };

    setRoutines(nextRoutines);
    setTodos(nextTodos);
    if (nextGroups) setGroups(nextGroups);

    setTodoData(updated);
  };

  /* ================= TOGGLES ================= */

  const toggleRoutine = (r: Routine) => {

    const done = r.completedToday === todayStr;

    const next = routines.map(x =>
      x.id === r.id
        ? { ...x, completedToday: done ? null : todayStr }
        : x
    );

    saveDb(next, todos);
  };

  const toggleTodo = (t: Todo) => {

    const done = t.status === "completed";

    const next: Todo[] = todos.map(x =>
      x.id === t.id
        ? {
          ...x,
          status: (done ? "pending" : "completed") as TodoStatus,
          completedAt: done ? null : new Date().toISOString()
        }
        : x
    );

    saveDb(routines, next);
  };

  /* ================= SAVE ITEM ================= */

  const handleSaveItem = (item: any) => {

    if (editorMode === "routine") {

      const exists = routines.some(r => r.id === item.id);

      const next = exists
        ? routines.map(r => r.id === item.id ? item : r)
        : [...routines, item];

      saveDb(next, todos);

    } else {

      const exists = todos.some(t => t.id === item.id);

      const next: Todo[] = exists
        ? todos.map(t => t.id === item.id ? item : t)
        : [...todos, item];

      saveDb(routines, next);
    }

    setEditorOpen(false);
  };

  const handleSync = async () => {
    await syncTodoToGitHub("Manual sync");
  };

  /* ================= FORMATTERS ================= */

  const formatRoutineTime = (timeStr?: string) => {
    if (!timeStr) return "";

    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;

    const [h, m] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getTimeLeftLabel = (deadline: string | null) => {

    if (!deadline) return "";

    const now = new Date();
    const end = new Date(deadline + "T23:59:59");

    let diff = Math.floor((end.getTime() - now.getTime()) / 60000);

    if (diff <= 0) return "Overdue";

    const minutes = diff;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (hours < 24) {
      const h = hours;
      const m = minutes % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    }

    if (days < 30) {
      const d = days;
      const h = hours % 24;
      if (h > 0) return `${d}d ${h}h`;
      return `${d}d`;
    }

    const mo = months;
    const d = days % 30;

    if (d > 0) return `${mo}mo ${d}d`;
    return `${mo}mo`;
  };

  /* ================= PRIORITY ENGINE OUTPUT ================= */

  const { urgentTodos, normalTodos } =
    buildTodoPriorityLists(todos);

  const { next3Hours, laterRoutines } =
    buildRoutinePriorityLists(routines);

  /* ================= ROWS ================= */

  const RoutineRow = (r: Routine) => (
    <PremiumTaskCard
      title={r.title}
      done={r.completedToday === todayStr}
      meta={formatRoutineTime(r.completeByTime ?? "")}
      groups={groups}
      groupIds={r.groupIds}
      onToggle={() => toggleRoutine(r)}
      onEdit={() => {
        setEditorMode("routine");
        setEditingItem(r);
        setEditorOpen(true);
      }}
      isUrgent={(r as any).isUrgent}
    />
  );

  const formatCompletedDate = (date?: string | null) => {
    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString([], {
      day: "numeric",
      month: "short"
    });
  };

  const TodoRow = (t: Todo) => {

    const isDone = t.status === "completed";

    return (
      <PremiumTaskCard
        title={t.title}
        done={isDone}

        /* ✅ META LOGIC FIXED */
        meta={
          isDone
            ? `Done ${formatCompletedDate(t.completedAt)}`
            : getTimeLeftLabel(t.deadline)
        }

        groups={groups}
        groupIds={t.groupIds}

        /* 🚫 completed items never urgent */
        isOverdue={!isDone && (t as any).isOverdue}

        onToggle={() => toggleTodo(t)}
        onEdit={() => {
          setEditorMode("todo");
          setEditingItem(t);
          setEditorOpen(true);
        }}
      />
    );
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="sm" >

      <Box
        sx={{
          mb: 3,
          p: 0.6,
          borderRadius: 999,
          background: "rgba(0,255,170,0.06)",
          border: "1px solid rgba(0,255,170,0.15)",
          backdropFilter: "blur(12px)"
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{
            style: { display: "none" }
          }}
          sx={{
            minHeight: 44,
            "& .MuiTabs-flexContainer": {
              gap: 0.5
            }
          }}
        >
          {["HOME", "TODOS", "ROUTINES", "COMPLETED"].map((label, index) => (
            <Tab
              key={label}
              label={label}
              disableRipple
              sx={{
                minHeight: 36,
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: 0.5,
                transition: "all .25s ease",
                color: tab === index
                  ? "#00ffa6"
                  : "rgba(255,255,255,0.6)",

                background:
                  tab === index
                    ? "rgba(0,255,170,0.12)"
                    : "transparent",

                "&:hover": {
                  background: "rgba(0,255,170,0.08)"
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ================= HOME ================= */}
      {tab === 0 && (
        <Stack spacing={2}>

          <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
            <Typography fontWeight={700} mb={1}>🔥 Priority Todos</Typography>
            <Stack spacing={1.2}>
              {urgentTodos.map(TodoRow)}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
            <Typography fontWeight={700} mb={1}>⏱ Next 3 Hours</Typography>
            <Stack spacing={1.2}>
              {next3Hours.map(RoutineRow)}
            </Stack>
          </Paper>

        </Stack>
      )}

      {/* ================= TODOS ================= */}
      {tab === 1 && (
        <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
          <Stack spacing={1.5}>
            {normalTodos.map(TodoRow)}
          </Stack>
        </Paper>
      )}

      {/* ================= ROUTINES ================= */}
      {tab === 2 && (
        <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
          <Stack spacing={1.5}>
            {laterRoutines.map(RoutineRow)}
          </Stack>
        </Paper>
      )}

      {/* ================= COMPLETED ================= */}
      {tab === 3 && (
        <Stack spacing={2}>

          <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
            <Typography fontWeight={700} mb={1}>Completed Daily Routines</Typography>
            <Stack spacing={1.2}>
              {routines.filter(r => r.completedToday === todayStr).map(RoutineRow)}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 3, background: "#041a11", border: "1px solid rgba(0,255,170,0.15)" }}>
            <Typography fontWeight={700} mb={1}>Completed Todos</Typography>
            <Stack spacing={1.2}>
              {todos.filter(t => t.status === "completed").map(TodoRow)}
            </Stack>
          </Paper>

        </Stack>
      )}

      <Box sx={{ position: "fixed", bottom: 24, right: 24, display: "flex", gap: 1 }}>

        <Button variant="contained" size="small" startIcon={<AddIcon />}
          onClick={() => { setEditorMode("todo"); setEditingItem(null); setEditorOpen(true); }}
        >Todo</Button>

        <Button variant="contained" size="small"
          onClick={() => { setEditorMode("routine"); setEditingItem(null); setEditorOpen(true); }}
        >Routine</Button>

        <Button variant="outlined" size="small" startIcon={<CategoryIcon />}
          onClick={() => setGroupModalOpen(true)}
        >Group</Button>

        <Button variant="outlined" size="small" startIcon={<SyncIcon />}
          onClick={handleSync}
        >Sync</Button>

      </Box>

      <TaskEditorModal
        open={editorOpen}
        mode={editorMode}
        item={editingItem}
        groups={groups}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveItem}
      />

      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={(g) => {
          const next = [...groups, g];
          saveDb(routines, todos, next);
          setGroupModalOpen(false);
        }}
      />

    </Container>
  );
}
