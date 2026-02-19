import { LocalNotifications } from "@capacitor/local-notifications";
import { Routine, Todo } from "../types/todoModels";

/* ================= PERMISSION ================= */

export async function initNotifications() {
  const perm = await LocalNotifications.requestPermissions();

  if (perm.display !== "granted") {
    console.warn("Notification permission not granted");
  }
}

/* ================= HELPERS ================= */

const todayStr = () => new Date().toISOString().slice(0, 10);

const toDate = (date: string, time?: string | null) => {
  if (!time) return null;

  const [h, m] = time.split(":").map(Number);

  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  return d;
};

const minutesBefore = (date: Date, min: number) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - min);
  return d;
};

/* ================= CLEAR ALL ================= */

export async function clearAllNotifications() {
  await LocalNotifications.cancel({ notifications: [] });
}

/* ================= ROUTINE NOTIFICATIONS ================= */
/*
Rule:
If routine has completeByTime
→ notify 5 minutes before
*/

export async function scheduleRoutineNotifications(routines: Routine[]) {

  const today = todayStr();

  const notifications: any[] = [];

  routines.forEach((r) => {

    if (!r.completeByTime) return;
    if (r.completedToday === today) return;

    const target = toDate(today, r.completeByTime);
    if (!target) return;

    const notifyAt = minutesBefore(target, 5);

    if (notifyAt.getTime() < Date.now()) return;

    notifications.push({
      id: Number(r.id.replace(/\D/g, "").slice(0, 9)) || Math.floor(Math.random()*999999),
      title: "Routine Reminder",
      body: `${r.title} in 5 minutes`,
      schedule: { at: notifyAt }
    });

  });

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

/* ================= TODO NOTIFICATIONS ================= */
/*
Rules:

If deadline === today:
- midnight notification
- 9 AM notification
*/

export async function scheduleTodoNotifications(todos: Todo[]) {

  const today = todayStr();

  const notifications: any[] = [];

  todos.forEach((t) => {

    if (!t.deadline) return;
    if (t.status === "completed") return;
    if (t.deadline !== today) return;

    const midnight = new Date(today + "T00:00:10");
    const nineAM = new Date(today + "T09:00:00");

    const baseId =
      Number(t.id.replace(/\D/g, "").slice(0, 6)) ||
      Math.floor(Math.random() * 999999);

    if (midnight.getTime() > Date.now()) {
      notifications.push({
        id: baseId + 100000,
        title: "Today's Task",
        body: t.title,
        schedule: { at: midnight }
      });
    }

    if (nineAM.getTime() > Date.now()) {
      notifications.push({
        id: baseId + 200000,
        title: "Reminder",
        body: `Don't forget: ${t.title}`,
        schedule: { at: nineAM }
      });
    }

  });

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

/* ================= MASTER SCHEDULER ================= */

export async function rescheduleAllNotifications(
  routines: Routine[],
  todos: Todo[]
) {
  await LocalNotifications.cancel({ notifications: [] });

  await scheduleRoutineNotifications(routines);
  await scheduleTodoNotifications(todos);
}
