export function calculateStreak(history: string[]) {

  if (!history || history.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...history].sort(); // ISO dates sort correctly

  let longest = 1;
  let current = 1;
  let running = 1;

  for (let i = 1; i < sorted.length; i++) {

    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    const diff =
      (curr.getTime() - prev.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  for (let i = sorted.length - 1; i > 0; i--) {

    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    const diff =
      (curr.getTime() - prev.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
    } else {
      break;
    }
  }

  if (sorted[sorted.length - 1] !== today) {
    current = 0;
  }

  return { current, longest };
}