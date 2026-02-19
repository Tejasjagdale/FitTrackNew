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

/* ---- FIXED TIME PARSER (12hr + 24hr) ---- */

const parseTime = (dateStr: string, time?: string | null) => {
  if (!time) return null;

  const d = new Date(dateStr);

  // supports "02:18 PM" or "14:18"
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3];

  if (ampm) {
    if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
    if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  }

  d.setHours(hour, minute, 0, 0);

  return d;
};

const minutesBefore = (date: Date, min: number) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - min);
  return d;
};

/* ================= CLEAR ALL ================= */

export async function clearAllNotifications() {
  const pending = await LocalNotifications.getPending();

  if (!pending.notifications.length) return;

  await LocalNotifications.cancel({
    notifications: pending.notifications.map(n => ({ id: n.id }))
  });
}

/* ================= ROUTINE NOTIFICATIONS ================= */

export async function scheduleRoutineNotifications(routines: Routine[]) {

  const today = todayStr();
  const notifications: any[] = [];

  routines.forEach((r) => {

    if (!r.completeByTime) return;
    if (r.completedToday === today) return;

    const target = parseTime(today, r.completeByTime);
    if (!target) return;

    const notifyAt = minutesBefore(target, 5);

    if (notifyAt.getTime() < Date.now()) return;

    notifications.push({
      id: Number(r.id.replace(/\D/g, "").slice(0, 9)) || Math.floor(Math.random()*999999),
      title: "Routine Reminder",
      body: `${r.title} in 5 minutes`,
      schedule: {
        at: notifyAt,
        allowWhileIdle: true   // ⭐ ANDROID DOZE FIX
      }
    });

  });

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

/* ================= TODO NOTIFICATIONS ================= */

export async function scheduleTodoNotifications(todos: Todo[]) {

  const today = todayStr();
  const notifications: any[] = [];

  todos.forEach((t) => {

    if (!t.deadline) return;
    if (t.status === "completed") return;
    if (t.deadline !== today) return;

    // ⭐ Force LOCAL timezone
    const midnight = new Date();
    midnight.setHours(0,0,10,0);

    const ninePM = new Date();
    ninePM.setHours(21,0,0,0); // 9 PM IST

    const baseId =
      Number(t.id.replace(/\D/g, "").slice(0, 6)) ||
      Math.floor(Math.random() * 999999);

    if (midnight.getTime() > Date.now()) {
      notifications.push({
        id: baseId + 100000,
        title: "Today's Task",
        body: t.title,
        schedule: {
          at: midnight,
          allowWhileIdle: true
        }
      });
    }

    if (ninePM.getTime() > Date.now()) {
      notifications.push({
        id: baseId + 200000,
        title: "Reminder",
        body: `Don't forget: ${t.title}`,
        schedule: {
          at: ninePM,
          allowWhileIdle: true
        }
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

  await clearAllNotifications();   // ⭐ REAL cancel
  await scheduleRoutineNotifications(routines);
  await scheduleTodoNotifications(todos);

}
