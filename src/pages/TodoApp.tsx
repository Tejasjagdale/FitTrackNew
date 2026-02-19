import {
  Container,
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Tooltip
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import SyncIcon from "@mui/icons-material/Sync";
import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/Checklist";
import RepeatIcon from "@mui/icons-material/Repeat";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InsightsIcon from "@mui/icons-material/Insights";
import GitHubIcon from "@mui/icons-material/GitHub";

import { useState, useMemo, useEffect, useRef } from "react";

import { premiumSurface, Routine, Todo } from "../types/todoModels";
import PremiumTaskCard from "../components/todoComponents/PremiumTaskCard";
import TaskEditorModal from "../components/todoComponents/TaskEditorModal";
import GroupModal from "../components/todoComponents/GroupModal";

import { useTodoStore } from "../components/hooks/useTodoStore";
import { buildTodoPriorityLists } from "../engine/todoPriorityEngine";
import { buildRoutinePriorityLists } from "../engine/routinePriorityEngine";
import DashboardView from "../components/todoComponents/DashboardView";

export default function TodoApp() {

  const {
    loading,
    routines,
    todos,
    groups,
    toggleRoutine,
    toggleTodo,
    saveDb,
    setGroups,
    handleSync,
    todayStr
  } = useTodoStore();

  const hasLoadedRef = useRef(false);
  const { urgentTodos, normalTodos } = buildTodoPriorityLists(todos);
  const { next3Hours, laterRoutines } = buildRoutinePriorityLists(routines);

  const [tab, setTab] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"routine" | "todo">("todo");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return; // ⭐ ignore initial load
    }
    setIsDirty(true);

  }, [routines, todos, groups]);

  /* ================= ANALYTICS ================= */

  const analytics = useMemo(() => {
    const routineDone = routines.filter(r => r.completedToday === todayStr).length;
    const routineTotal = routines.length;
    const todoDone = todos.filter(t => t.status === "completed").length;
    const todoTotal = todos.length;

    return { routineDone, routineTotal, todoDone, todoTotal };
  }, [routines, todos, todayStr]);

  const routineProgress =
    analytics.routineTotal === 0 ? 0 :
      (analytics.routineDone / analytics.routineTotal) * 100;

  const todoProgress =
    analytics.todoTotal === 0 ? 0 :
      (analytics.todoDone / analytics.todoTotal) * 100;

  /* ================= HELPERS ================= */



  const formatRoutineTime = (timeStr?: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;

    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);

    return d.toLocaleTimeString([], {
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

    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h`;

    return `${Math.floor(hours / 24)}d`;
  };

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
      onDelete={() => {
        const next = routines.filter(x => x.id !== r.id);
        saveDb(next, todos);
      }}
    />
  );

  const TodoRow = (t: Todo) => {
    const isDone = t.status === "completed";

    return (
      <PremiumTaskCard
        title={t.title}
        done={isDone}
        meta={isDone ? "Done" : getTimeLeftLabel(t.deadline)}
        groups={groups}
        groupIds={t.groupIds}
        isOverdue={!isDone && (t as any).isOverdue}
        onToggle={() => toggleTodo(t)}
        onEdit={() => {
          setEditorMode("todo");
          setEditingItem(t);
          setEditorOpen(true);
        }}
        onDelete={() => {
          const next = todos.filter(x => x.id !== t.id);
          saveDb(routines, next);
        }}
      />
    );
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  const sidebar = [
    { icon: <HomeIcon />, label: "Home" },
    { icon: <CheckIcon />, label: "Todos" },
    { icon: <RepeatIcon />, label: "Routines" },
    { icon: <DoneAllIcon />, label: "Completed" },
    { icon: <InsightsIcon />, label: "Dashboard" }
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Box sx={{
        width: 64,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 1,
        gap: 2
      }}>
        {sidebar.map((s, i) => (
          <Tooltip title={s.label} placement="right" key={i}>
            <Box
              onClick={() => setTab(i)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                color: tab === i ? "#00ffa6" : "rgba(255,255,255,0.5)",
                background: tab === i ? "rgba(0,255,170,0.12)" : "transparent"
              }}
            >
              {s.icon}
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* MAIN CONTENT */}
      <Container maxWidth="sm">

        {/* ACTION BAR */}
        {tab !== 4 && (
          <Stack direction="row" spacing={1} mb={1}>
            <Button startIcon={<AddIcon />} variant="contained"
              sx={{
                cursor: "pointer",
                background: "#00ffa6"
              }}
              onClick={() => { setEditorMode("todo"); setEditingItem(null); setEditorOpen(true); }}>
              Todo
            </Button>

            <Button variant="contained" sx={{
              cursor: "pointer",
              background: "#00ffa6"
            }}
              onClick={() => { setEditorMode("routine"); setEditingItem(null); setEditorOpen(true); }}>
              Routine
            </Button>

            <Button startIcon={<CategoryIcon />} variant="outlined" sx={{
              cursor: "pointer",
              color: "#00ffa6",
              background: "rgba(0,255,170,0.12)"
            }}
              onClick={() => setGroupModalOpen(true)}>
              Group
            </Button>

            <Button
              startIcon={<GitHubIcon />}
              variant="contained"
              onClick={async () => {
                await handleSync();
                setIsDirty(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,

                /* GitHub black button */
                background: "#24292f",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",

                animation: isDirty ? "githubPulse 1.6s ease-in-out infinite" : "none",

                "@keyframes githubPulse": {
                  "0%": {
                    boxShadow: "0 0 0 rgba(0,255,170,0)"
                  },
                  "50%": {
                    boxShadow: "0 0 18px rgba(255, 0, 0, 0.35)"
                  },
                  "100%": {
                    boxShadow: "0 0 0 rgba(0,255,170,0)"
                  }
                },

                "&:hover": {
                  background: "#2f363d"
                }
              }}
            >
              {isDirty ? "Sync changes" : "Up to date"}
            </Button>


          </Stack>
        )}

        {/* ================= HOME TAB ================= */}
        {tab === 0 && (
          <Stack spacing={2}>

            {/* PROGRESS CARDS 50/50 */}
            <Stack direction="row" spacing={2}>

              {/* ROUTINES */}
              <Paper sx={{
                ...premiumSurface,
                flex: 1,
                p: 2,
                borderRadius: 4
              }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={14} sx={{ opacity: 0.7 }}>
                    Daily Routines
                  </Typography>

                  <Typography fontWeight={700}>
                    {analytics.routineDone}/{analytics.routineTotal}
                  </Typography>
                </Stack>

                <LinearProgress
                  value={routineProgress}
                  variant="determinate"
                  sx={{ mt: 0.5, height: 5, borderRadius: 99 }}
                />
              </Paper>

              {/* TODOS */}
              <Paper sx={{
                ...premiumSurface,
                flex: 1,
                p: 2,
                borderRadius: 4
              }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontSize={14} sx={{ opacity: 0.7 }}>
                    Todo Tasks
                  </Typography>

                  <Typography fontWeight={700}>
                    {analytics.todoDone}/{analytics.todoTotal}
                  </Typography>
                </Stack>

                <LinearProgress
                  value={todoProgress}
                  variant="determinate"
                  sx={{ mt: 0.5, height: 5, borderRadius: 99 }}
                />
              </Paper>

            </Stack>

            {/* PRIORITY TODOS */}
            <Paper sx={{ ...premiumSurface, p: 2.2, borderRadius: 2 }}>
              <Typography fontWeight={700} sx={{
                color: "#c6ffe6",
                textShadow: "0 0 12px rgba(0,255,170,0.25)"
              }}>
                🔥 Priority Todos
              </Typography>

              <Stack spacing={1.2}>
                {urgentTodos.map(TodoRow)}
              </Stack>
            </Paper>

            {/* NEXT 3 HOURS */}
            <Paper sx={{ ...premiumSurface, p: 2.2, borderRadius: 2 }}>
              <Typography fontWeight={700}>⏱ Next 3 Hours</Typography>

              <Stack spacing={1.2}>
                {next3Hours.map(RoutineRow)}
              </Stack>
            </Paper>

          </Stack>
        )}

        {/* TODOS TAB */}
        {tab === 1 && (
          <Paper sx={{ ...premiumSurface, p: 2, borderRadius: 2 }}>
            <Typography fontWeight={700}> All Todos</Typography>
            <Stack spacing={1.5}>
              {normalTodos.map(TodoRow)}
            </Stack>
          </Paper>
        )}

        {/* ROUTINES TAB */}
        {tab === 2 && (
          <Paper sx={{ ...premiumSurface, p: 2, borderRadius: 2 }}>
            <Typography fontWeight={700}>All Routines</Typography>
            <Stack spacing={1.5}>
              {laterRoutines.map(RoutineRow)}
            </Stack>
          </Paper>
        )}

        {/* COMPLETED */}
        {/* COMPLETED TAB — RESTORED TWO CARDS */}
        {tab === 3 && (
          <Stack spacing={2}>

            {/* COMPLETED ROUTINES */}
            <Paper
              sx={{
                ...premiumSurface,
                p: 2,
                borderRadius: 2
              }}
            >
              <Typography fontWeight={700} mb={1}>
                Completed Daily Routines
              </Typography>

              <Stack spacing={1.2}>
                {routines
                  .filter(r => r.completedToday === todayStr)
                  .map(RoutineRow)}
              </Stack>
            </Paper>

            {/* COMPLETED TODOS */}
            <Paper
              sx={{
                ...premiumSurface,
                p: 2,
                borderRadius: 2
              }}
            >
              <Typography fontWeight={700} mb={1}>
                Completed Todos
              </Typography>

              <Stack spacing={1.2}>
                {todos
                  .filter(t => t.status === "completed")
                  .map(TodoRow)}
              </Stack>
            </Paper>

          </Stack>
        )}


        {/* DASHBOARD */}
        {tab === 4 && (
          <DashboardView routines={routines} />
        )}

      </Container>

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
        onSave={(g: any) => {
          setGroups(prev => [...prev, g]);
          setGroupModalOpen(false);
        }}
      />

    </Box>
  );
}
