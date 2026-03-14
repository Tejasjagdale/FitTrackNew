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
  SwipeableDrawer,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/Checklist";
import RepeatIcon from "@mui/icons-material/Repeat";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { useState, useMemo, useEffect, useRef } from "react";

import { premiumSurface, Routine, Todo } from "../types/todoModels";
import PremiumTaskCard from "../components/todoComponents/PremiumTaskCard";
import TaskEditorModal from "../components/todoComponents/TaskEditorModal";
import GroupModal from "../components/todoComponents/GroupModal";

import { useTodoStore } from "../components/hooks/useTodoStore";
import { buildTodoPriorityLists } from "../engine/todoPriorityEngine";
import { buildRoutinePriorityLists } from "../engine/routinePriorityEngine";
import DashboardView from "../components/todoComponents/DashboardView";
import { rescheduleAllNotifications } from "../engine/notificationService";
import GroupListView from "../components/todoComponents/GroupListView";
import { nowIST } from "../utils/istTime";
import TodoTabs from "../components/todoComponents/TodoTabs";
import { calculateStreak } from "../utils/streakUtils";
import { text } from "stream/consumers";

export default function TodoApp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const [tab, setTab] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"routine" | "todo">("todo");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const updateRoutineHistory = (routineId: string, history: string[]) => {

    const streak = calculateStreak(history);

    const nextRoutines = routines.map(r =>
      r.id === routineId
        ? {
          ...r,
          history,
          streak
        }
        : r
    );

    saveDb(nextRoutines, todos);
  };
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

  const filteredTodos = normalTodos.filter(t => {
    const groupMatch = groupFilter.length
      ? t.groupIds?.some((id: string) => groupFilter.includes(id))
      : true;

    const searchMatch = search
      ? t.title.toLowerCase().includes(search.toLowerCase())
      : true;

    return groupMatch && searchMatch;
  });

  const filteredRoutines = laterRoutines.filter(r => {
    const groupMatch = groupFilter.length
      ? r.groupIds?.some((id: string) => groupFilter.includes(id))
      : true;

    const searchMatch = search
      ? r.title.toLowerCase().includes(search.toLowerCase())
      : true;

    return groupMatch && searchMatch;
  });

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

  const priorityDone = todos.filter(t => t.status === "completed").length;
  const priorityTotal = todos.length;

  const nextHoursDone = routines.filter(r => r.completedToday === todayStr).length;
  const nextHoursTotal = routines.length;

  const isRoutineOverdue = (r: Routine) => {

    if (!r.completeByTime) return false;
    if (r.completedToday === todayStr) return false;

    const now = nowIST();

    const parts = r.completeByTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return false;

    let h = Number(parts[1]);
    const m = Number(parts[2]);
    const ampm = parts[3].toUpperCase();

    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const due = nowIST();
    due.setHours(h, m, 0, 0);

    return now.getTime() > due.getTime();
  };

  const EmptyState = ({ label }: { label: string }) => (
    <Box
      sx={{
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0.5,
        opacity: 0.65,
        textAlign: "center",

        /* subtle floating animation */
        animation: "emptyFloat 3.5s ease-in-out infinite",

        "@keyframes emptyFloat": {
          "0%": { transform: "translateY(0px)", opacity: 0.55 },
          "50%": { transform: "translateY(-4px)", opacity: 0.8 },
          "100%": { transform: "translateY(0px)", opacity: 0.55 }
        }
      }}
    >
      <Typography
        sx={{
          fontSize: 28,
          lineHeight: 1,
          filter: "drop-shadow(0 0 6px rgba(0,255,170,0.25))"
        }}
      >
        🧘‍♂️
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          letterSpacing: ".3px",
          color: theme.palette.text.secondary
        }}
      >
        Nothing here yet
      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          opacity: 0.6
        }}
      >
        No {label}
      </Typography>
    </Box>
  );
  const CardHeaderProgress = ({
    done,
    total
  }: {
    done: number;
    total: number;
  }) => {

    const percent = total === 0 ? 0 : (done / total) * 100;

    return (
      <Box
        sx={{
          minWidth: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        {/* COUNTER */}
        <Typography
          sx={{
            fontSize: 11,
            opacity: 0.75,
            letterSpacing: ".3px"
          }}
        >
          {done} / {total}
        </Typography>

        {/* PREMIUM BAR */}
        <Box
          sx={{
            position: "relative",
            mt: 0.4,
            width: 90,
            height: 6,
            borderRadius: 999,
            overflow: "hidden",
            background:
              "linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
            backdropFilter: "blur(8px)"
          }}
        >
          {/* GLOW FILL */}
          <Box
            sx={{
              height: "100%",
              width: `${percent}%`,
              borderRadius: 999,

              background:
                "linear-gradient(90deg,#00ffa6,#00d4ff)",

              boxShadow:
                "0 0 10px rgba(0,255,170,0.6), 0 0 20px rgba(0,255,170,0.25)",

              transition: "width .45s cubic-bezier(.2,.8,.2,1)",

              animation: percent
                ? "premiumBarPulse 2.2s ease-in-out infinite"
                : "none",

              "@keyframes premiumBarPulse": {
                "0%": { filter: "brightness(1)" },
                "50%": { filter: "brightness(1.3)" },
                "100%": { filter: "brightness(1)" }
              }
            }}
          />
        </Box>
      </Box>
    );
  };
  /* ================= ROWS ================= */

  const RoutineRow = (r: Routine) => {

    const overdue = isRoutineOverdue(r);

    return (
      <PremiumTaskCard
        key={r.id}
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
        isOverdue={overdue}
        streak={r.streak?.current}

        routine={r}
        onRoutineHistoryChange={updateRoutineHistory}
      />
    );
  };

  const TodoRow = (t: Todo) => {

    const isDone = t.status === "completed";

    return (
      <PremiumTaskCard
        key={t.id}
        title={t.title}
        done={isDone}
        meta={isDone ? "Completed" : getTimeLeftLabel(t.deadline)}

        groups={groups}
        groupIds={t.groupIds}

        isOverdue={!isDone && (t as any).isOverdue}

        onToggle={() => toggleTodo(t)}

        onEdit={() => {
          setEditorMode("todo");
          setEditingItem(t);
          setEditorOpen(true);
        }}

        /* explicitly not a routine */
        routine={null}
      />
    );
  };

  const TAB_COUNT = 6; // total tabs you have

  const handleTabChange = (_: any, next: number) => {

    if (next < 0) {
      setTab(TAB_COUNT - 1); // go to last tab
      return;
    }

    if (next >= TAB_COUNT) {
      setTab(0); // go back to first tab
      return;
    }

    setTab(next);
  };

  if (loading) {
    return <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 1.5, sm: 2 },
        mb: { xs: 8, sm: 10 }
      }}
    ><Typography color="text.primary">Loading...</Typography></Container>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        px: { xs: 1, sm: 2 }
      }}
    >
      <Box
        sx={{
          position: "fixed",
          bottom: 45,
          right: 40,
          zIndex: 1200
        }}
      >
        <Button
          size="small"
          variant="contained"
          disableElevation
          startIcon={
            isSyncing ? (
              <SyncRoundedIcon
                sx={{
                  fontSize: 18,
                  animation: "spin 0.9s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                  }
                }}
              />
            ) : isDirty ? (
              <SaveRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
            )
          }
          onClick={async () => {

            if (isSyncing) return;

            setIsSyncing(true);

            await handleSync();

            initialSnapshotRef.current = JSON.stringify({ routines, todos, groups });
            setIsDirty(false);
            setSyncSuccess(true);

            setTimeout(() => setIsSyncing(false), 800);
          }}
          sx={{
            px: 2.4,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            letterSpacing: ".4px",

            backdropFilter: "blur(12px)",

            border: `1px solid ${theme.palette.divider}`,

            background: theme.palette.background.paper,
            color: theme.palette.text.primary,

            transition: "all .2s ease",

            ...(isDirty && !isSyncing && {
              background: theme.palette.error.main,
              color: theme.palette.getContrastText(theme.palette.error.main),

              animation: "dangerPulse 0.9s ease-in-out infinite",

              "@keyframes dangerPulse": {
                "0%": { boxShadow: `0 0 6px ${theme.palette.error.main}40` },
                "50%": { boxShadow: `0 0 20px ${theme.palette.error.main}` },
                "100%": { boxShadow: `0 0 6px ${theme.palette.error.main}40` }
              }
            }),

            ...(isSyncing && {
              background: theme.palette.success.main,
              color: theme.palette.getContrastText(theme.palette.success.main)
            }),

            "&:hover": {
              transform: "translateY(-1px)"
            }
          }}
        >
          {isSyncing
            ? "Syncing..."
            : isDirty
              ? "Save changes"
              : "Up to date"}
        </Button>
      </Box>

      {/* MAIN CONTENT */}
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 8, sm: 10 }
        }}
      >

        <TodoTabs
          tab={tab}
          handleTabChange={handleTabChange}
          isMobile={isMobile}
          theme={theme}
        />

        {/* HOME */}
        {tab === 0 && (
          <Stack spacing={2} >
            <Paper sx={{
              ...premiumSurface(theme), p: 2
            }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography fontWeight={700}>🔥 Priority Todos</Typography>

                <CardHeaderProgress
                  done={priorityDone}
                  total={priorityTotal}
                />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                {urgentTodos.length
                  ? urgentTodos.map(TodoRow)
                  : <EmptyState label="priority todos" />}
              </Stack>
            </Paper>

            <Paper sx={{
              ...premiumSurface(theme), p: 2
            }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography fontWeight={700}>⏱ Next 3 Hours</Typography>

                <CardHeaderProgress
                  done={nextHoursDone}
                  total={nextHoursTotal}
                />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                {next3Hours.length
                  ? next3Hours.map(RoutineRow)
                  : <EmptyState label="routines here" />}
              </Stack>
            </Paper>

            <DashboardView
              routines={routines}
              todos={todos}
              groups={groups}
              onToggleTodo={toggleTodo}
              onEditTodo={(t) => {
                setEditorMode("todo")
                setEditingItem(t)
                setEditorOpen(true)
              }}
              onAddTodo={() => {
                setEditorMode("todo"); // or routine
                setEditingItem(null);
                setEditorOpen(true);
              }}
            />
          </Stack>
        )}

        {tab === 1 && (
          <Paper sx={{
            ...premiumSurface(theme), p: 2, display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 240
          }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              {searchOpen ? <></> : <Typography fontWeight={700}>📝 All Todos</Typography>}

              <Stack direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                useFlexGap>

                <Box
                  sx={{
                    flex: searchOpen ? 1 : "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end"
                  }}
                >
                  {!searchOpen ? (
                    <IconButton
                      size="small"
                      onClick={() => setSearchOpen(true)}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.primary.main,
                        background: theme.palette.background.paper,
                        width: 34,
                        height: 34
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <TextField
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      size="small"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          height: 34,
                          borderRadius: 999,
                          fontSize: 13,
                          background: theme.palette.background.paper,
                          backdropFilter: "blur(12px)"
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSearch("");
                                setSearchOpen(false);
                              }}
                            >
                              <ClearIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                </Box>
                {/* GROUP MULTISELECT */}
                <FormControl size="small">
                  <Select
                    multiple
                    value={groupFilter}
                    displayEmpty
                    onChange={(e) =>
                      setGroupFilter(e.target.value as string[])
                    }
                    renderValue={(selected) =>
                      selected.length
                        ? `${selected.length} groups`
                        : "Groups"
                    }
                    sx={{
                      height: 34,
                      fontSize: 12,
                      borderRadius: 999,

                      background: theme.palette.background.paper,

                      backdropFilter: "blur(12px)",

                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.divider
                      },

                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main
                      },

                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main
                      },

                      ".MuiSelect-icon": {
                        color: theme.palette.primary.main
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 1,
                          borderRadius: 2,
                          maxHeight: 260,

                          background:
                            theme.palette.background.paper,
                          backdropFilter: "blur(18px)",
                          border: "1px solid rgba(0,255,170,0.18)",

                          /* ===== PREMIUM SCROLLBAR ===== */
                          overflowY: "auto",

                          "&::-webkit-scrollbar": {
                            width: 6
                          },

                          "&::-webkit-scrollbar-track": {
                            background: "transparent"
                          },

                          "&::-webkit-scrollbar-thumb": {
                            background:
                              "linear-gradient(180deg,#00ffa6,#2c6a31)",
                            borderRadius: 999
                          },

                          "&::-webkit-scrollbar-thumb:hover": {
                            background:
                              "linear-gradient(180deg,#00ffa6,#549957)"
                          },

                          /* Firefox */
                          scrollbarWidth: "thin",
                          scrollbarColor: `${theme.palette.primary.main} transparent`,

                          "& .MuiMenuItem-root": {
                            fontSize: 13,
                            borderRadius: 1,
                            mx: 0.5,
                            my: 0.2,

                            "&.Mui-selected": {
                              background:
                                "linear-gradient(135deg,rgba(0,255,170,0.18),rgba(0,255,170,0.08))"
                            },

                            "&:hover": {
                              background: "theme.palette.action.hover"
                            }
                          }
                        }
                      }
                    }}
                  >
                    {groups.map(g => (
                      <MenuItem key={g.id} value={g.id}>
                        <Checkbox
                          checked={groupFilter.includes(g.id)}
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            "&.Mui-checked": {
                              color: theme.palette.primary.main
                            }
                          }}
                        />
                        <ListItemText primary={g.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  onClick={() => {
                    setEditorMode("todo"); // or routine
                    setEditingItem(null);
                    setEditorOpen(true);
                  }}
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 999,

                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,

                    background: theme.palette.background.paper,

                    backdropFilter: "blur(10px)",

                    transition: "all .18s ease",

                    "& svg": {
                      fontSize: { xs: 18, sm: 20 }
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>

              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1 }}>
              {filteredTodos.length
                ? filteredTodos.map(TodoRow)
                : <EmptyState label="todos" />}
            </Stack>
          </Paper>
        )}

        {tab === 2 && (
          <Paper sx={{
            ...premiumSurface(theme), p: 2, display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 240
          }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              {searchOpen ? <></> : <Typography fontWeight={700}>🔁 All Routines</Typography>}

              <Stack direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                useFlexGap>

                <Box
                  sx={{
                    flex: searchOpen ? 1 : "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end"
                  }}
                >
                  {!searchOpen ? (
                    <IconButton
                      size="small"
                      onClick={() => setSearchOpen(true)}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.primary.main,
                        background: theme.palette.background.paper,
                        width: 34,
                        height: 34
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <TextField
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      size="small"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          height: 34,
                          borderRadius: 999,
                          fontSize: 13,
                          background:
                            "linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
                          backdropFilter: "blur(14px)"
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSearch("");
                                setSearchOpen(false);
                              }}
                            >
                              <ClearIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                </Box>

                {/* GROUP MULTISELECT */}
                <FormControl size="small">
                  <Select
                    multiple
                    value={groupFilter}
                    displayEmpty
                    onChange={(e) =>
                      setGroupFilter(e.target.value as string[])
                    }
                    renderValue={(selected) =>
                      selected.length
                        ? `${selected.length} groups`
                        : "Groups"
                    }
                    sx={{
                      height: 34,
                      fontSize: 12,
                      borderRadius: 999,

                      background: theme.palette.background.paper,

                      backdropFilter: "blur(12px)",

                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.divider
                      },

                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main
                      },

                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main
                      },

                      ".MuiSelect-icon": {
                        color: theme.palette.primary.main
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 1,
                          borderRadius: 2,
                          maxHeight: 260,

                          background:theme.palette.background.paper,
                          backdropFilter: "blur(18px)",
                          border: "1px solid rgba(0,255,170,0.18)",

                          /* ===== PREMIUM SCROLLBAR ===== */
                          overflowY: "auto",

                          "&::-webkit-scrollbar": {
                            width: 6
                          },

                          "&::-webkit-scrollbar-track": {
                            background: "transparent"
                          },

                          "&::-webkit-scrollbar-thumb": {
                            background:
                              "linear-gradient(180deg,#00ffa6,#2c6a31)",
                            borderRadius: 999
                          },

                          "&::-webkit-scrollbar-thumb:hover": {
                            background:
                              "linear-gradient(180deg,#00ffa6,#549957)"
                          },

                          /* Firefox */
                          scrollbarWidth: "thin",
                          scrollbarColor: `${theme.palette.primary.main} transparent`,

                          "& .MuiMenuItem-root": {
                            fontSize: 13,
                            borderRadius: 1,
                            mx: 0.5,
                            my: 0.2,

                            "&.Mui-selected": {
                              background:
                                "linear-gradient(135deg,rgba(0,255,170,0.18),rgba(0,255,170,0.08))"
                            },

                            "&:hover": {
                              background: theme.palette.action.hover
                            }
                          }
                        }
                      }
                    }}
                  >
                    {groups.map(g => (
                      <MenuItem key={g.id} value={g.id}>
                        <Checkbox
                          checked={groupFilter.includes(g.id)}
                          size="small"
                          sx={{
                            color: `${theme.palette.primary.main}`,
                            "&.Mui-checked": {
                              color: `${theme.palette.primary.main}`
                            }
                          }}
                        />
                        <ListItemText primary={g.name} color={theme.palette.primary.main} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  size="small"
                  onClick={() => {
                    setEditorMode("routine");
                    setEditingItem(null);
                    setEditorOpen(true);
                  }}
                 sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 999,

                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,

                    background: theme.palette.background.paper,

                    backdropFilter: "blur(10px)",

                    transition: "all .18s ease",

                    "& svg": {
                      fontSize: { xs: 18, sm: 20 }
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>

              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1 }}>
              {filteredRoutines.length
                ? filteredRoutines.map(RoutineRow)
                : <EmptyState label="routines" />}
            </Stack>
          </Paper>
        )}

        {tab === 3 && (
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Paper sx={{
              ...premiumSurface(theme), p: 2
            }}>
              <Typography fontWeight={700} mb={1}> 🟢 Completed Daily Routines</Typography>
              <Stack spacing={1.2} sx={{ flex: 1 }}>
                {routines.filter(r => r.completedToday === todayStr).length
                  ? routines.filter(r => r.completedToday === todayStr).map(RoutineRow)
                  : <EmptyState label="completed routines" />}
              </Stack>
            </Paper>

            <Paper sx={{
              ...premiumSurface(theme), p: 2
            }}>
              <Typography fontWeight={700} mb={1}> ✔️ Completed Todos</Typography>
              <Stack spacing={1.2} sx={{ flex: 1 }}>
                {todos.filter(t => t.status === "completed").length
                  ? todos.filter(t => t.status === "completed").map(TodoRow)
                  : <EmptyState label="completed todos" />}
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* ⭐ GROUPS TAB */}
        {tab === 4 && (
          <Paper sx={{
            ...premiumSurface(theme), p: 2, display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 240
          }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography fontWeight={700} mb={1}> 🧩 Groups</Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ background: theme.palette.primary.main, alignSelf: "flex-start" }}
                onClick={() => setGroupModalOpen(true)}
                startIcon={<GroupsIcon fontSize="small" />}
              >
                Group
              </Button></Stack>

            <GroupListView
              groups={groups}
              onDelete={(id) => {
                const nextGroups = groups.filter(g => g.id !== id);
                saveDb(routines, todos, nextGroups);   // ✅ persist
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
        onDelete={(id) => {

          if (editorMode === "routine") {
            const next = routines.filter(r => r.id !== id);
            saveDb(next, todos);
          } else {
            const next = todos.filter(t => t.id !== id);
            saveDb(routines, next);
          }

          setEditorOpen(false);
        }}
      />

      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={(g: any) => {
          const nextGroups = [...groups, g];
          saveDb(routines, todos, nextGroups);   // ✅ persist
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

