import {
  Container,
  Box,
  Stack,
  Fab,
  CircularProgress,
  Typography,
  Button,
  Paper,
  Checkbox,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputAdornment,
  IconButton,
  LinearProgress
} from "@mui/material";
import { useTheme, useMediaQuery } from '@mui/material';

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

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

import { getDaysDiff, getRepeatDiff } from "../engine/taskPriorityEngine";

import TabsHeader from "../components/todoComponents/TabsHeader";
import TaskList from "../components/todoComponents/TaskList";
import StreakList from "../components/todoComponents/StreakList";
import TaskModal from "../components/todoComponents/TaskModal";
import GroupModal from "../components/todoComponents/GroupModal";
import ConfirmDialog from "../components/todoComponents/ConfirmDialog";
import GroupList from "../components/todoComponents/GroupList";
import HomeDashboard from "../components/todoComponents/HomeDashboard";

/* ================= PAGE ================= */

export default function TodoPage() {

  /* ================= STATE ================= */

  const [isDirty, setIsDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [view, setView] = useState<'pending' | 'completed' | 'streaks' | 'groups'>('pending');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);

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

  /* ================= HOOKS ================= */

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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

  const showFilters = view === 'pending' || view === 'completed';

  // Pending stats for progress bars (completed vs total)
  const pendingTasksList = tasks.filter(t => t.status === 'pending');
  const totalPending = pendingTasksList.length;

  const todaysList = tasks.filter(t => {
    if (t.type === 'deadline' && t.deadline) return getDaysDiff(t.deadline) === 0;
    if (t.type === 'repeat') {
      const every = t.repeatEveryDays || 1;
      if (every === 1) return true;
      return getRepeatDiff(t) <= 0;
    }
    return false;
  });

  const todaysTotal = todaysList.length;
  const todaysCompleted = todaysList.filter(t => t.status === 'completed').length;
  const todaysPercent = todaysTotal === 0 ? 0 : Math.round((todaysCompleted / todaysTotal) * 100);

  const overallTotal = tasks.length;
  const overallCompleted = tasks.filter(t => t.status === 'completed').length;
  const overallPercent = overallTotal === 0 ? 0 : Math.round((overallCompleted / overallTotal) * 100);

  return (
    <Container maxWidth="md" sx={{ p: 0 }}>

      <Box>

        <Stack spacing={2}>

          {/* ================= UNIFIED FILTER BAR ================= */}

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 1,
              background: "linear-gradient(135deg,#1e293b,#0f172a)",
              color: "#fff"
            }}
          >
            <Stack spacing={1.5}>
              {/* View Selector */}
              <Box sx={{ minWidth: 160 }}>
                <TextField
                  select
                  size="small"
                  value={view}
                  onChange={e => setView(e.target.value as any)}
                  sx={{ width: '100%', '& .MuiOutlinedInput-root': { color: '#fff' } }}
                >
                  <MenuItem value="pending">Pending Tasks</MenuItem>
                  <MenuItem value="completed">Completed Tasks</MenuItem>
                  <MenuItem value="streaks">Streaks</MenuItem>
                  <MenuItem value="groups">Groups</MenuItem>
                </TextField>
              </Box>

              {/* Additional Filters - Show when viewing pending or completed */}
              {showFilters && (
                <>
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
                          background: "rgba(255,255,255,0.05)"
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Stack>

                  {/* Filter Dropdowns */}
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
                        <option key={g.id} value={g.id}>
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
                </>
              )}
            </Stack>
          </Paper>


          {/* ================= CONTENT ================= */}

          <Box>

            {view === 'pending' && (
              <>
                <Paper sx={{ p: 2, mb: 1.5, borderRadius: 1.5, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Today's Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress variant="determinate" value={todaysPercent} sx={{ height: 8, borderRadius: 2 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ minWidth: 120, textAlign: 'right' }}>{todaysCompleted} of {todaysTotal} completed</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ width: 12 }} />

                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Overall Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress variant="determinate" value={overallPercent} sx={{ height: 8, borderRadius: 2 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ minWidth: 120, textAlign: 'right' }}>{overallCompleted} of {overallTotal} completed</Typography>
                    </Box>
                  </Box>
                </Paper>

                <HomeDashboard
                  tasks={tasks}
                  groups={groups}
                  onSelectTask={t => {
                    setEditingTask(t);
                    setTaskModalOpen(true);
                  }}
                  onComplete={handleToggleComplete}
                />
              </>
            )}

            {/* {tab === 0 && (
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
            )} */}


            {view === 'completed' && (
              <>
                {filteredTasks.filter(t => t.status === "completed").length > 0 ? (
                  <Stack spacing={1.5}>
                    {filteredTasks.filter(t => t.status === "completed").map((task) => (
                      <Paper
                        key={task.id}
                        sx={{
                          p: 1.75,
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.04) 0%, rgba(56, 142, 60, 0.04) 100%)',
                          border: '1.5px solid rgba(76, 175, 80, 0.15)',
                          borderRadius: 1.5,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#4caf50',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Checkbox
                            size="small"
                            checked
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(task);
                            }}
                            sx={{
                              p: 0.5,
                              color: '#4caf50',
                              '&.Mui-checked': {
                                color: '#4caf50'
                              }
                            }}
                          />

                          <Box sx={{ flex: 1 }} onClick={() => {
                            setEditingTask(task);
                            setTaskModalOpen(true);
                          }}>
                            <Box sx={{ mb: 0.75 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: 'text.secondary',
                                  textDecoration: 'line-through'
                                }}
                              >
                                {task.title}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip
                                label="Completed"
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: '#4caf50',
                                  color: '#fff',
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                      border: '1px dashed rgba(76, 175, 80, 0.2)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                      No completed tasks
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Complete tasks to see them here
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            {view === 'streaks' && (
              <StreakList tasks={tasks} />
            )}

            {view === 'groups' && (
              <GroupList
                groups={groups}
                tasks={tasks}
                onSelect={() => setView('pending')}
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
