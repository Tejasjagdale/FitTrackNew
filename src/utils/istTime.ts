/* IST utilities – keeps whole app locked to Asia/Kolkata */

const IST_TZ = "Asia/Kolkata";

/* ================= DATE OBJECT IN IST ================= */
export function nowIST(): Date {
  // converts current time into IST-based Date object
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const map: any = {};
  parts.forEach(p => { if (p.type !== "literal") map[p.type] = p.value });

  return new Date(
    `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`
  );
}

/* ================= YYYY-MM-DD IN IST ================= */
export function todayISTString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

/* ================= ISO STRING IN IST ================= */
export function isoNowIST(): string {
  return nowIST().toISOString();
}
