export function getTimeLeft(deadline: string) {

  const now = new Date().getTime();
  const end = new Date(deadline).getTime();

  const diff = end - now;

  if (diff <= 0) {
    return {
      overdue: true,
      text: "Overdue",
      days: 0,
      hours: 0
    };
  }

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );

  let text = "";

  if (days > 0) {
    text = `${days}d ${hours}h left`;
  } else {
    text = `${hours}h left`;
  }

  return {
    overdue: false,
    text,
    days,
    hours
  };
}
