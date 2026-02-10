import { Task } from '../types/todoModels'
// Use Capacitor Local Notifications when available
let LocalNotifications: any = null
try {
  // lazy import to avoid build errors in web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocalNotifications = require('@capacitor/local-notifications').LocalNotifications
} catch (e) {
  LocalNotifications = null
}

function toISDate(d: Date) {
  // returns ISO string for scheduling; keep as local time
  return d.toISOString()
}

export async function initNotifications() {
  if (LocalNotifications) {
    try {
      await LocalNotifications.requestPermissions()
    } catch (e) {
      console.warn('LocalNotifications permission request failed', e)
    }
  } else if ('Notification' in window) {
    if (Notification.permission === 'default') await Notification.requestPermission()
  }
}

export async function scheduleTaskNotification(task: Task) {
  if (!task || !task.deadline) return
  const when = new Date(task.deadline)
  // Schedule a notification 30 minutes before deadline and at deadline if in future
  const items: { id: number; title: string; body: string; scheduleAt: Date }[] = []
  const before = new Date(when.getTime() - 30 * 60 * 1000)
  const now = new Date()
  if (before > now) {
    items.push({
      id: hashString(task.id + '-30'),
      title: `Upcoming: ${task.title}`,
      body: `Due at ${when.toLocaleString('en-IN')}`,
      scheduleAt: before
    })
  }
  if (when > now) {
    items.push({
      id: hashString(task.id + '-0'),
      title: `Due: ${task.title}`,
      body: `Due now (${when.toLocaleString('en-IN')})`,
      scheduleAt: when
    })
  }

  function hashString(s: string) {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  for (const it of items) {
    if (LocalNotifications) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: it.id,
              title: it.title,
              body: it.body,
              schedule: { at: it.scheduleAt },
              smallIcon: 'res://notification_icon'
            }
          ]
        })
      } catch (e) {
        console.warn('Failed scheduling local notification', e)
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      const delay = it.scheduleAt.getTime() - Date.now()
      setTimeout(() => {
        new Notification(it.title, { body: it.body })
      }, Math.max(0, delay))
    }
  }
}

export async function scheduleAllForTasks(tasks: Task[]) {
  await initNotifications()
  for (const t of tasks) {
    if (t.status === 'pending' && t.deadline) {
      scheduleTaskNotification(t)
    }
  }
}

export async function cancelAllScheduled() {
  if (LocalNotifications) {
    try {
      await LocalNotifications.cancelAll()
    } catch (e) {
      console.warn('Failed to cancel local notifications', e)
    }
  }
  // No-op for browser fallback; timeouts are not tracked here
}

// no global prototype changes; using local hashString helper above
