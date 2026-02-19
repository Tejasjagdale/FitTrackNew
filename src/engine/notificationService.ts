import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { Routine, Todo } from "../types/todoModels";
import { nowIST, todayISTString } from "../utils/istTime";

/* =========================================================
   PLATFORM GUARD
   ========================================================= */

const isNative = () => Capacitor.getPlatform() !== "web";

/* ================= PERMISSION + CHANNELS ================= */

export async function initNotifications() {

  if (!isNative()) {
    console.log("LocalNotifications skipped on web");
    return;
  }

  const perm = await LocalNotifications.requestPermissions();

  if (perm.display !== "granted") {
    console.warn("Notification permission not granted");
  }

  await LocalNotifications.createChannel({
    id: "routine_channel",
    name: "Routine Reminders",
    description: "Daily routine alerts",
    importance: 4,
    visibility: 1,
    sound: "default"
  });

  await LocalNotifications.createChannel({
    id: "todo_channel",
    name: "Todo Alerts",
    description: "Today's task reminders",
    importance: 3,
    visibility: 1
  });
}

/* ================= HELPERS ================= */

const todayStr = () => todayISTString();

/* ---- IST SAFE TIME PARSER ---- */

const parseTime = (dateStr: string, time?: string | null) => {
  if (!time) return null;

  const d = new Date(dateStr + "T00:00:00+05:30");

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

  if (!isNative()) return;

  const pending = await LocalNotifications.getPending();

  if (!pending.notifications.length) return;

  await LocalNotifications.cancel({
    notifications: pending.notifications.map(n => ({ id: n.id }))
  });
}

/* ================= ROUTINE NOTIFICATIONS ================= */

export async function scheduleRoutineNotifications(routines: Routine[]) {

  if (!isNative()) return;

  const today = todayStr();
  const notifications: any[] = [];

  routines.forEach((r) => {

    if (!r.completeByTime) return;
    if (r.completedToday === today) return;

    const target = parseTime(today, r.completeByTime);
    if (!target) return;

    const notifyAt = minutesBefore(target, 5);

    if (notifyAt.getTime() < nowIST().getTime()) return;

    notifications.push({
      id:
        Number(r.id.replace(/\D/g, "").slice(0, 9)) ||
        Math.floor(Math.random() * 999999),

      title: `Routine : ${r.title}`,
      body: `🔥 Streak at risk starts in 5 minutes`,
      largeBody: `Your ${r.title} routine is scheduled for ${r.completeByTime}. Stay consistent and protect your streak.`,

      color: "#00ffa6",
      smallIcon: "ic_notification",
      channelId: "routine_channel",
      group: "routine_group",

      schedule: {
        at: notifyAt,
        allowWhileIdle: true
      }
    });

  });

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

/* ================= TODO NOTIFICATIONS ================= */

export async function scheduleTodoNotifications(todos: Todo[]) {

  if (!isNative()) return;

  const today = todayStr();
  const notifications: any[] = [];

  todos.forEach((t) => {

    if (!t.deadline) return;
    if (t.status === "completed") return;
    if (t.deadline !== today) return;

    /* ⭐ IST MIDNIGHT */
    const midnight = new Date(today + "T00:00:10+05:30");

    /* ⭐ IST 9PM */
    const ninePM = new Date(today + "T21:00:00+05:30");

    const baseId =
      Number(t.id.replace(/\D/g, "").slice(0, 6)) ||
      Math.floor(Math.random() * 999999);

    if (midnight.getTime() > nowIST().getTime()) {
      notifications.push({
        id: baseId + 100000,

        title: `${t.title} 📌 Today’s Focus`,
        body: t.title,
        largeBody: `Your task for today: ${t.title}`,

        color: "#00ffa6",
        smallIcon: "ic_notification",
        channelId: "todo_channel",
        group: "todo_group",

        schedule: {
          at: midnight,
          allowWhileIdle: true
        }
      });
    }

    if (ninePM.getTime() > nowIST().getTime()) {
      notifications.push({
        id: baseId + 200000,

        title: `${t.title} ⏱ Still Pending`,
        body: `Don't forget: ${t.title}`,
        largeBody: `You still have an unfinished task today: ${t.title}`,

        color: "#00ffa6",
        smallIcon: "ic_notification",
        channelId: "todo_channel",
        group: "todo_group",

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

  if (!isNative()) return;

  await clearAllNotifications();

  await scheduleRoutineNotifications(routines);
  await scheduleTodoNotifications(todos);
}
