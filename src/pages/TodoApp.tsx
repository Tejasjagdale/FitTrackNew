import {
  Container,
  Box,
  Stack,
  Fab,
  CircularProgress,
  Typography,
  Button,
  Paper
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";

import { useEffect, useState } from "react";

import {
  loadTodoData,
  getTodoData,
  setTodoData,
  syncTodoToGitHub
} from "../data/todoDataService";

import { Task, Group } from "../types/todoModels";

import {
  resetRepeatTasks,
  toggleCompleteTask
} from "../engine/taskEngine";

import TabsHeader from "../components/todoComponents/TabsHeader";
import TaskList from "../components/todoComponents/TaskList";
import StreakList from "../components/todoComponents/StreakList";
import TaskModal from "../components/todoComponents/TaskModal";
import GroupModal from "../components/todoComponents/GroupModal";
import ConfirmDialog from "../components/todoComponents/ConfirmDialog";
import GroupList from "../components/todoComponents/GroupList";

/* ================= PAGE ================= */

export default function TodoPage() {
  /* ================= STATE ================= */

  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState(0);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  /* ================= FILTER STATE ================= */

  const [search, setSearch] = useState("");

  const [filterGroup, setFilterGroup] =
    useState<string>("all");

  const [filterType, setFilterType] =
    useState<"all" | "deadline" | "repeat">("all");

  const [filterStatus, setFilterStatus] =
    useState<"all" | "pending" | "on_hold">("pending");

  const [filterPriority, setFilterPriority] =
    useState<number | "all">("all");

  /* ================= LOAD ================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        await loadTodoData();

        if (cancelled) return;

        const db = getTodoData();

        const fixed = resetRepeatTasks(db.tasks);

        setTasks(fixed);
        setGroups(db.groups);

        setTodoData({
          ...db,
          tasks: fixed
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= CONFIRM ================= */

  const openConfirm = (
    title: string,
    message: string,
    action: () => void
  ) => {
    setConfirmConfig({ title, message, onConfirm: action });
    setConfirmOpen(true);
  };

  /* ================= SAVE ================= */

  const saveToDb = async (
    nextTasks: Task[],
    nextGroups: Group[] | null,
    msg: string
  ) => {
    const db = getTodoData();

    const updated = {
      ...db,
      tasks: nextTasks,
      groups: nextGroups ?? db.groups
    };

    setTasks(nextTasks);

    if (nextGroups) setGroups(nextGroups);

    setTodoData(updated);

    await syncTodoToGitHub(msg);
  };

  /* ================= TASK ================= */

  const handleToggleComplete = (task: Task) => {
    const done = task.status === "completed";

    openConfirm(
      done ? "Reopen Task" : "Complete Task",

      done
        ? "Move this task back to active?"
        : "Mark this task as done?",

      async () => {
        const next = tasks.map(t =>
          t.id === task.id
            ? toggleCompleteTask(t)
            : t
        );

        await saveToDb(
          next,
          null,
          done ? "Reopen task" : "Complete task"
        );

        setConfirmOpen(false);
      }
    );
  };

  const handleSaveTask = async (task: Task) => {
    const exists = tasks.some(t => t.id === task.id);

    const next = exists
      ? tasks.map(t =>
          t.id === task.id ? task : t
        )
      : [...tasks, task];

    await saveToDb(next, null, "Save task");

    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    openConfirm(
      "Delete Task",
      "This cannot be undone. Continue?",

      async () => {
        const next = tasks.filter(t => t.id !== id);

        await saveToDb(next, null, "Delete task");

        setTaskModalOpen(false);
        setEditingTask(null);

        setConfirmOpen(false);
      }
    );
  };

  /* ================= GROUP ================= */

  const handleSaveGroup = async (group: Group) => {
    await saveToDb(tasks, [...groups, group], "Add group");
    setGroupModalOpen(false);
  };

  /* ================= FILTER ENGINE ================= */

  const filteredTasks = tasks.filter(t => {
    /* Status */
    if (filterStatus !== "all" && t.status !== filterStatus)
      return false;

    /* Search */
    if (
      search &&
      !t.title
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;

    /* Group */
    if (
      filterGroup !== "all" &&
      !t.groupIds.includes(filterGroup)
    )
      return false;

    /* Type */
    if (filterType !== "all" && t.type !== filterType)
      return false;

    /* Priority */
    if (
      filterPriority !== "all" &&
      t.priority !== filterPriority
    )
      return false;

    return true;
  });

  const completedTasks = tasks.filter(
    t => t.status === "completed"
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Container>
        <Box py={6} textAlign="center">
          <CircularProgress />
          <Typography mt={2}>Loading…</Typography>
        </Box>
      </Container>
    );
  }

  /* ================= RENDER ================= */

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Stack spacing={3}>

          {/* ================= HEADER ================= */}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,

              background:
                "linear-gradient(135deg,#1e293b,#0f172a)",

              color: "#fff"
            }}
          >
            <Typography fontWeight={700}>
              🚀 Daily Command Center
            </Typography>

            <Typography fontSize="0.8rem">
              Stay focused. Finish strong.
            </Typography>
          </Paper>

          {/* ================= FILTER BAR ================= */}

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,

              background: "rgba(255,255,255,0.04)",

              backdropFilter: "blur(8px)"
            }}
          >
            <Stack spacing={1.5}>

              {/* Search */}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search tasks..."

                style={{
                  width: "100%",
                  padding: "8px 12px",

                  borderRadius: 8,
                  border: "none",

                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",

                  outline: "none",

                  fontSize: "0.9rem"
                }}
              />

              {/* Filters */}
              <Stack direction="row" spacing={1} flexWrap="wrap">

                {/* Group */}
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Groups</option>

                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                {/* Type */}
                <select
                  value={filterType}
                  onChange={e =>
                    setFilterType(e.target.value as any)
                  }
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="deadline">Deadline</option>
                  <option value="repeat">Repeat</option>
                </select>

                {/* Status */}
                <select
                  value={filterStatus}
                  onChange={e =>
                    setFilterStatus(e.target.value as any)
                  }
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Active</option>
                  <option value="on_hold">On Hold</option>
                </select>

                {/* Priority */}
                <select
                  value={filterPriority}
                  onChange={e =>
                    setFilterPriority(
                      e.target.value === "all"
                        ? "all"
                        : Number(e.target.value)
                    )
                  }
                  className="filter-select"
                >
                  <option value="all">All Priority</option>
                  <option value={5}>Critical</option>
                  <option value={4}>High</option>
                  <option value={3}>Medium</option>
                  <option value={2}>Low</option>
                  <option value={1}>Trivial</option>
                </select>

                {/* Reset */}
                <Button
                  size="small"
                  onClick={() => {
                    setSearch("");
                    setFilterGroup("all");
                    setFilterType("all");
                    setFilterStatus("pending");
                    setFilterPriority("all");
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* ================= TABS ================= */}

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",

              background:
                "rgba(255,255,255,0.03)"
            }}
          >
            <TabsHeader value={tab} onChange={setTab} />
          </Paper>

          {/* ================= CONTENT ================= */}

          <Box>

            {tab === 0 && (
              <TaskList
                tasks={filteredTasks}
                onComplete={handleToggleComplete}
                onEdit={t => {
                  setEditingTask(t);
                  setTaskModalOpen(true);
                }}
              />
            )}

            {tab === 1 && (
              <TaskList
                tasks={completedTasks}
                onComplete={handleToggleComplete}
                onEdit={t => {
                  setEditingTask(t);
                  setTaskModalOpen(true);
                }}
              />
            )}

            {tab === 2 && <StreakList tasks={tasks} />}

            {tab === 3 && (
              <GroupList
                groups={groups}
                tasks={tasks}
                onSelect={() => setTab(0)}
              />
            )}

          </Box>
        </Stack>

        {/* ================= FLOATING ACTIONS ================= */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24
          }}
        >
          <Fab
            color="secondary"
            size="small"
            onClick={() => setGroupModalOpen(true)}
          >
            <CategoryIcon />
          </Fab>

          <Fab
            color="primary"
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            <AddIcon />
          </Fab>
        </Stack>

        {/* ================= MODALS ================= */}

        <TaskModal
          open={taskModalOpen}
          task={editingTask}
          groups={groups}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />

        <GroupModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          onSave={handleSaveGroup}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={confirmConfig?.title || ""}
          message={confirmConfig?.message || ""}
          confirmText="Yes"
          cancelText="Cancel"
          onConfirm={() => confirmConfig?.onConfirm()}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmConfig(null);
          }}
        />
      </Box>
    </Container>
  );
}
