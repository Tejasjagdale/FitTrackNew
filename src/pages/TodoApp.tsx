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

  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

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

  const saveToDb = (
    nextTasks: Task[],
    nextGroups: Group[] | null
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

    setIsDirty(true);
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

        saveToDb(next, null);

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

    saveToDb(next, null);

    setTaskModalOpen(false);
    setEditingTask(null);
  };


  const handleDeleteTask = (id: string) => {

    openConfirm(
      "Delete Task",
      "This cannot be undone. Continue?",

      async () => {

        const next = tasks.filter(t => t.id !== id);

        saveToDb(next, null);

        setTaskModalOpen(false);
        setEditingTask(null);

        setConfirmOpen(false);
      }
    );
  };


  const handleSync = async () => {

    try {

      setSyncing(true);

      await syncTodoToGitHub("Manual sync");

      setIsDirty(false);

      setSyncSuccess(true);

      setTimeout(() => {
        setSyncSuccess(false);
      }, 2000);

    } catch (err) {

      console.error("Sync failed:", err);
      alert("Sync failed. Check console.");

    } finally {
      setSyncing(false);
    }
  };


  /* ================= GROUP ================= */

  const handleSaveGroup = (group: Group) => {

    const nextGroups = [...groups, group];

    saveToDb(tasks, nextGroups);

    setGroupModalOpen(false);
  };


  /* ================= FILTER ENGINE ================= */

  const filteredTasks = tasks.filter(t => {

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

  const showFilters = tab === 0 || tab === 1;


  return (
    <Container maxWidth="md" sx={{ p: 0 }}>

      <Box>

        <Stack spacing={2}>


          {/* ================= STICKY TABS ================= */}

          <Paper
            elevation={2}
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,

              borderRadius: 2,

              background: "#020617"
            }}
          >
            <TabsHeader
              value={tab}
              onChange={setTab}
            />
          </Paper>


          {/* ================= FILTER BAR ================= */}

          {showFilters && (

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 1,

                background:
                  "linear-gradient(135deg,#1e293b,#0f172a)",

                color: "#fff"
              }}
            >
              <Stack spacing={1.5}>


                {/* Search Row */}

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search tasks..."
                    style={{
                      flex: 1,

                      padding: "8px 12px",

                      borderRadius: 8,
                      border: "none",

                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",

                      outline: "none",

                      fontSize: "0.9rem"
                    }}
                  />

                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setSearch("");
                      setFilterGroup("all");
                      setFilterType("all");
                      setFilterPriority("all");
                    }}
                    sx={{
                      color: "#18e96f",

                      "&:hover": {
                        background:
                          "rgba(255,255,255,0.05)"
                      }
                    }}
                  >
                    Clear
                  </Button>

                </Stack>


                {/* Filter Row */}

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                >

                  <select
                    value={filterGroup}
                    onChange={e =>
                      setFilterGroup(e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="all">All Groups</option>

                    {groups.map(g => (
                      <option
                        key={g.id}
                        value={g.id}
                      >
                        {g.name}
                      </option>
                    ))}
                  </select>


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

                </Stack>

              </Stack>
            </Paper>
          )}


          {/* ================= CONTENT ================= */}

          <Box>

            {tab === 0 && (
              <TaskList
                tasks={filteredTasks.filter(
                  t => t.status === "pending"
                )}
                onComplete={handleToggleComplete}
                onEdit={t => {
                  setEditingTask(t);
                  setTaskModalOpen(true);
                }}
              />
            )}


            {tab === 1 && (
              <TaskList
                tasks={filteredTasks.filter(
                  t => t.status === "completed"
                )}
                onComplete={handleToggleComplete}
                onEdit={t => {
                  setEditingTask(t);
                  setTaskModalOpen(true);
                }}
              />
            )}


            {tab === 2 && (
              <StreakList tasks={tasks} />
            )}


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
            right: 24,
            zIndex: 50
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


          <Fab
            color={isDirty ? "warning" : "success"}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "⟳"
            )}
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
          onConfirm={() =>
            confirmConfig?.onConfirm()
          }
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmConfig(null);
          }}
        />

      </Box>


      {/* ================= SYNC TOAST ================= */}

      {syncSuccess && (

        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 24,

            px: 2,
            py: 1,

            borderRadius: 2,

            background:
              "linear-gradient(135deg,#1b5e20,#2e7d32)",

            color: "#fff",

            animation: "fadeIn .3s",

            "@keyframes fadeIn": {
              from: {
                opacity: 0,
                transform: "translateY(10px)"
              },
              to: {
                opacity: 1,
                transform: "translateY(0)"
              }
            }
          }}
        >
          ✅ Synced to GitHub
        </Paper>
      )}

    </Container>
  );
}
