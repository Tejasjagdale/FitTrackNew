import { useEffect, useMemo, useState } from "react";

import {
  loadTodoData,
  getTodoData,
  setTodoData,
  syncTodoToGitHub,
} from "../../data/todoDataService";

import { Routine, Todo, Group, TodoStatus } from "../../types/todoModels";

import { recalcStreak } from "../../engine/routinePriorityEngine";
import {
  initNotifications,
  rescheduleAllNotifications,
} from "../../engine/notificationService";
import { isoNowIST, todayISTString } from "../../utils/istTime";

export function useTodoStore() {
  const [loading, setLoading] = useState(true);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const todayStr = todayISTString();

  /* ================= LOAD ================= */

  useEffect(() => {
    async function load() {
      await initNotifications();

      await loadTodoData();
      const db = getTodoData();

      setRoutines(db.routines);
      setTodos(db.todos);
      setGroups(db.groups);

      setLoading(false);

      await rescheduleAllNotifications(db.routines, db.todos);
    }
    load();
  }, []);

  /* ================= SAVE ================= */

  const saveDb = (
    nextRoutines: Routine[],
    nextTodos: Todo[],
    nextGroups?: Group[],
  ) => {
    const db = getTodoData();

    const updated = {
      ...db,
      routines: nextRoutines,
      todos: nextTodos,
      groups: nextGroups ?? db.groups,
    };

    setRoutines(nextRoutines);
    setTodos(nextTodos);
    if (nextGroups) setGroups(nextGroups);

    setTodoData(updated);

    // keep notifications in sync with latest data
    rescheduleAllNotifications(nextRoutines, nextTodos);
  };

  /* ================= ROUTINE TOGGLE ================= */

  const toggleRoutine = (r: Routine) => {
    const done = r.completedToday === todayStr;

    const next = routines.map((x) => {
      if (x.id !== r.id) return x;

      let history: string[] = x.history ?? [];

      /* ❌ UNCHECK */
      if (done) {
        history = history.filter((d) => d !== todayStr);

        return {
          ...x,
          completedToday: null,
          history,
          streak: recalcStreak(history),
        };
      }

      /* ✅ CHECK */
      if (!history.includes(todayStr)) {
        history = [...history, todayStr];
      }

      return {
        ...x,
        completedToday: todayStr,
        history,
        streak: recalcStreak(history),
      };
    });

    saveDb(next, todos);
  };

  /* ================= TODO TOGGLE ================= */

  const toggleTodo = (t: Todo) => {
    const done = t.status === "completed";

    const next = todos.map((x) =>
      x.id === t.id
        ? {
            ...x,
            status: (done ? "pending" : "completed") as TodoStatus,
            completedAt: done ? null : isoNowIST(),
          }
        : x,
    );

    saveDb(routines, next);
  };

  /* ================= GROUP ================= */

  const addGroup = (g: Group) => {
    saveDb(routines, todos, [...groups, g]);
  };

  /* ================= SYNC ================= */

  const handleSync = async () => {
    await syncTodoToGitHub("Manual sync");
  };

  /* ================= DASHBOARD ANALYTICS ================= */

  const analytics = useMemo(() => {
    const routineDone = routines.filter(
      (r) => r.completedToday === todayStr,
    ).length;

    const routineTotal = routines.length;

    const todoDone = todos.filter((t) => t.status === "completed").length;

    const todoPending = todos.filter((t) => t.status !== "completed").length;

    const todayTodos = todos.filter(
      (t) => t.deadline === todayStr && t.status !== "completed",
    ).length;

    return {
      routineDone,
      routineTotal,
      todoDone,
      todoPending,
      todayTodos,
    };
  }, [routines, todos, todayStr]);

  return {
    loading,

    routines,
    todos,
    groups,

    analytics,

    toggleRoutine,
    toggleTodo,
    addGroup,

    saveDb,
    handleSync,
    setGroups, // needed by dashboard modals

    todayStr,
  };
}
