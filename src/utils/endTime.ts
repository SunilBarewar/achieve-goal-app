export type EndTimePreset = {
  id: string;
  label: string;
  getEndsAt: (now?: Date) => number;
};

function atClockTime(hours: number, minutes: number, base: Date): Date {
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function rollToTomorrowIfPast(target: Date, now: Date): Date {
  if (target.getTime() <= now.getTime()) {
    const tomorrow = new Date(target);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return target;
}

export function resolveEndTime(hours: number, minutes: number, now = new Date()): number {
  const today = atClockTime(hours, minutes, now);
  return rollToTomorrowIfPast(today, now).getTime();
}

export const END_TIME_PRESETS: EndTimePreset[] = [
  {
    id: '6pm',
    label: 'Until 6:00 PM',
    getEndsAt: now => resolveEndTime(18, 0, now),
  },
  {
    id: '8pm',
    label: 'Until 8:00 PM',
    getEndsAt: now => resolveEndTime(20, 0, now),
  },
  {
    id: '10pm',
    label: 'Until 10:00 PM',
    getEndsAt: now => resolveEndTime(22, 0, now),
  },
  {
    id: 'midnight',
    label: 'Until midnight',
    getEndsAt: now => resolveEndTime(0, 0, now),
  },
];

export function formatEndTime(endsAtMs: number, now = new Date()): string {
  const target = new Date(endsAtMs);
  const isToday =
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    target.getDate() === tomorrow.getDate() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getFullYear() === tomorrow.getFullYear();

  const time = target.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) {
    return `${time} (today)`;
  }
  if (isTomorrow) {
    return `Tomorrow, ${time}`;
  }
  return target.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCountdown(endsAtMs: number, now = Date.now()): string {
  const remainingMs = Math.max(0, endsAtMs - now);
  const totalMinutes = Math.floor(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `in ${minutes}m`;
  }
  return 'soon';
}

export function formatUnblocksAt(endsAtMs: number): string {
  const target = new Date(endsAtMs);
  return target.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
