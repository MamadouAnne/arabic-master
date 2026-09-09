import type { TFunction } from 'i18next';

/** "21 min left" / "under a minute left" — never a bare clock for a story. */
export function formatMinutesLeft(seconds: number, t: TFunction): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return t('listen.underAMinute');
  return t('listen.minutesLeft', { count: minutes });
}

/** Elapsed / remaining under the scrubber. */
export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
