import {
  Container,
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  SwipeableDrawer
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/Checklist";
import RepeatIcon from "@mui/icons-material/Repeat";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InsightsIcon from "@mui/icons-material/Insights";
import GitHubIcon from "@mui/icons-material/GitHub";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";

import { useState, useMemo, useEffect, useRef } from "react";

import { premiumSurface, Routine, Todo } from "../types/todoModels";
import PremiumTaskCard from "../components/todoComponents/PremiumTaskCard";
import TaskEditorModal from "../components/todoComponents/TaskEditorModal";
import GroupModal from "../components/todoComponents/GroupModal";

import { useTodoStore } from "../components/hooks/useTodoStore";
import { buildTodoPriorityLists } from "../engine/todoPriorityEngine";
import { buildRoutinePriorityLists } from "../engine/routinePriorityEngine";
import DashboardView from "../components/todoComponents/DashboardView";
import { initNotifications, rescheduleAllNotifications } from "../engine/notificationService";
import GroupListView from "../components/todoComponents/GroupListView";
import { nowIST } from "../utils/istTime";

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
  const initialSnapshotRef = useRef<string>("");

  const { urgentTodos, normalTodos } = buildTodoPriorityLists(todos);
  const { next3Hours, laterRoutines } = buildRoutinePriorityLists(routines);

  const [tab, setTab] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"routine" | "todo">("todo");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    initNotifications();
  }, []);

  /* ================= INITIAL SNAPSHOT ================= */

  useEffect(() => {
    if (loading) return;

    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = JSON.stringify({
        routines,
        todos,
        groups
      });
    }
  }, [loading]);

  /* ================= DIRTY DETECTOR ================= */

  useEffect(() => {
    if (!initialSnapshotRef.current) return;

    const current = JSON.stringify({
      routines,
      todos,
      groups
    });

    setIsDirty(current !== initialSnapshotRef.current);
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

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    rescheduleAllNotifications(routines, todos);
  }, [routines, todos]);

  /* ================= HELPERS ================= */

  const formatRoutineTime = (timeStr?: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;

    const [h, m] = timeStr.split(":").map(Number);
    const d = nowIST();
    d.setHours(h, m, 0, 0);

    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getTimeLeftLabel = (deadline: string | null) => {
    if (!deadline) return "";

    const now = nowIST();
    const end = new Date(deadline + "T23:59:59+05:30");

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
      streak={r.streak?.current}
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

  /* ================= SIDEBAR ================= */

  const sidebar = [
    { icon: <></>, label: "" },
    { icon: <HomeIcon />, label: "Home" },
    { icon: <CheckIcon />, label: "Todos" },
    { icon: <RepeatIcon />, label: "Routines" },
    { icon: <DoneAllIcon />, label: "Completed" },
    { icon: <InsightsIcon />, label: "Dashboard" },
    { icon: <GroupsIcon />, label: "Groups" }
  ];

  const sidebarContent = (
    <Box sx={{ width: 70, display: "flex", flexDirection: "column", alignItems: "center", pt: 10, gap: 2 }}>
      {sidebar.map((s, i) => (
        <Tooltip title={s.label} placement="right" key={i}>
          <Box
            onClick={() => {
              setTab(i);
              if (isMobile) setMobileSidebarOpen(false);
            }}
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
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {isMobile ? (
        <SwipeableDrawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onOpen={() => setMobileSidebarOpen(true)}
          swipeAreaWidth={50}
          PaperProps={{
            sx: {
              width: 80,
              background: "#06110d",
              borderRight: "1px solid rgba(255,255,255,0.06)"
            }
          }}
        >
          {sidebarContent}
        </SwipeableDrawer>
      ) : (
        <Box sx={{ width: 64, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {sidebarContent}
        </Box>
      )}

      {/* MAIN CONTENT */}
      <Container maxWidth="sm">

        {/* ACTION BAR */}

        <Stack direction="row" spacing={0.5} mb={1}>
          {tab !== 5 && tab !== 6 && <Button startIcon={<CheckIcon />} size="small" variant="contained" sx={{ background: "#00ffa6" }}
            onClick={() => { setEditorMode("todo"); setEditingItem(null); setEditorOpen(true); }}>
            Todo
          </Button>}

          {tab !== 5 && tab !== 6 && <Button startIcon={<RepeatIcon />} size="small" variant="contained" sx={{ background: "#00ffa6" }}
            onClick={() => { setEditorMode("routine"); setEditingItem(null); setEditorOpen(true); }}>
            Routine
          </Button>}

          {tab === 6 && <Button
            variant="contained"
            size="small"
            sx={{ background: "#00ffa6", alignSelf: "flex-start" }}
            onClick={() => setGroupModalOpen(true)}
            startIcon={<AddIcon fontSize="small" />}
          >
            Create Group
          </Button>}

          {tab !== 5 && <Button
            startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
            size="small"
            variant="contained"
            onClick={async () => {
              await handleSync();
              initialSnapshotRef.current = JSON.stringify({ routines, todos, groups });
              setIsDirty(false);
              setSyncSuccess(true);
            }}
            sx={{
              background: isDirty ? "#961717" : "#24292f",
              animation: isDirty ? "githubPulse 1s ease-in-out infinite" : "none",
              "@keyframes githubPulse": {
                "50%": { boxShadow: "0 0 50px rgba(255,0,0,0.85)" }
              }
            }}
          >
            {isDirty ? "Sync changes" : "Up to date"}
          </Button>}


        </Stack>


        {/* HOME */}
        {tab === 1 && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Paper sx={{ ...premiumSurface, flex: 1, p: 1 }}>
                <Typography fontSize={12}>Daily Routines</Typography>
                <LinearProgress value={routineProgress} variant="determinate" />
              </Paper>

              <Paper sx={{ ...premiumSurface, flex: 1, p: 1 }}>
                <Typography fontSize={12}>Todo Tasks</Typography>
                <LinearProgress value={todoProgress} variant="determinate" />
              </Paper>
            </Stack>

            <Paper sx={{ ...premiumSurface, p: 2 }}>
              <Typography fontWeight={700}>🔥 Priority Todos</Typography>
              <Stack spacing={1}>{urgentTodos.map(TodoRow)}</Stack>
            </Paper>

            <Paper sx={{ ...premiumSurface, p: 2 }}>
              <Typography fontWeight={700}>⏱ Next 3 Hours</Typography>
              <Stack spacing={1}>{next3Hours.map(RoutineRow)}</Stack>
            </Paper>
          </Stack>
        )}

        {tab === 2 && (
          <Paper sx={{ ...premiumSurface, p: 2 }}>
            <Typography fontWeight={700}>All Todos</Typography>
            <Stack spacing={1.5}>{normalTodos.map(TodoRow)}</Stack>
          </Paper>
        )}

        {tab === 3 && (
          <Paper sx={{ ...premiumSurface, p: 2 }}>
            <Typography fontWeight={700}>All Routines</Typography>
            <Stack spacing={1.5}>{laterRoutines.map(RoutineRow)}</Stack>
          </Paper>
        )}

        {tab === 4 && (
          <Stack spacing={2}>
            <Paper sx={{ ...premiumSurface, p: 2 }}>
              <Typography fontWeight={700} mb={1}>Completed Daily Routines</Typography>
              <Stack spacing={1.2}>
                {routines.filter(r => r.completedToday === todayStr).map(RoutineRow)}
              </Stack>
            </Paper>

            <Paper sx={{ ...premiumSurface, p: 2 }}>
              <Typography fontWeight={700} mb={1}>Completed Todos</Typography>
              <Stack spacing={1.2}>
                {todos.filter(t => t.status === "completed").map(TodoRow)}
              </Stack>
            </Paper>
          </Stack>
        )}

        {tab === 5 && (
          <DashboardView
            routines={routines}
            todos={todos}
          />
        )}

        {/* ⭐ GROUPS TAB */}
        {tab === 6 && (
          <Paper sx={{ ...premiumSurface, p: 2 }}>
            <Typography fontWeight={700} mb={1}>Groups</Typography>
            <GroupListView
              groups={groups}
              onDelete={(id) => {
                setGroups(prev => prev.filter(g => g.id !== id));
              }}
            />
          </Paper>
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

      <Snackbar
        open={syncSuccess}
        autoHideDuration={3000}
        onClose={() => setSyncSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled">
          Synced successfully
        </Alert>
      </Snackbar>

    </Box>
  );
}
