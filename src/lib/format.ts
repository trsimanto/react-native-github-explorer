export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${trim(value / 1000)}k`;
  return `${trim(value / 1_000_000)}m`;
}

function trim(value: number): string {
  return value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      const amount = Math.round(seconds / size);
      return formatUnit(amount, unit);
    }
  }
  return 'just now';
}

function formatUnit(amount: number, unit: Intl.RelativeTimeFormatUnit): string {
  const abs = Math.abs(amount);
  const label = `${abs} ${unit}${abs === 1 ? '' : 's'}`;
  return amount < 0 ? `${label} ago` : `in ${label}`;
}

export function formatResetTime(resetAt: Date | null, now: Date = new Date()): string {
  if (!resetAt) return 'Please try again in a few minutes.';
  const minutes = Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 60_000));
  const clock = resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Resets at ${clock} (in about ${minutes} min).`;
}
