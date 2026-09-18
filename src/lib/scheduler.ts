import { Reminder } from '@/types/reminder'

type ReminderSchedule = Pick<
  Reminder,
  'startTime' | 'endTime' | 'interval' | 'enabled'
>

function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number)

  const hours = parts[0]
  const minutes = parts[1]
  const seconds = parts[2] ?? 0

  return hours * 3600 + minutes * 60 + seconds
}

function secondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Returns all daily occurrences for a reminder.
 *
 * Example:
 * 09:00 → 10:00, interval 20
 *
 * 09:00
 * 09:20
 * 09:40
 * 10:00
 */
export function getDailyOccurrences(
  reminder: ReminderSchedule
): string[] {
  if (!reminder.enabled) {
    return []
  }

  const startSeconds = timeToSeconds(reminder.startTime)
  const endSeconds = timeToSeconds(reminder.endTime)
  const intervalSeconds = reminder.interval * 60

  const occurrences: string[] = []

  for (
    let currentSeconds = startSeconds;
    currentSeconds <= endSeconds;
    currentSeconds += intervalSeconds
  ) {
    occurrences.push(secondsToTime(currentSeconds))
  }

  return occurrences
}

/**
 * Returns the next occurrence relative to the current time.
 *
 * The interval is always anchored to startTime.
 */
export function getNextOccurrence(
  currentTime: string,
  reminder: ReminderSchedule
): string | null {
  if (!reminder.enabled) {
    return null
  }

  const currentSeconds = timeToSeconds(currentTime)
  const startSeconds = timeToSeconds(reminder.startTime)
  const endSeconds = timeToSeconds(reminder.endTime)
  const intervalSeconds = reminder.interval * 60

  if (currentSeconds < startSeconds) {
    return secondsToTime(startSeconds)
  }

  if (currentSeconds > endSeconds) {
    return null
  }

  const elapsedSeconds = currentSeconds - startSeconds

  const intervalsPassed = Math.ceil(
    elapsedSeconds / intervalSeconds
  )

  const nextOccurrenceSeconds =
    startSeconds + intervalsPassed * intervalSeconds

  if (nextOccurrenceSeconds > endSeconds) {
    return null
  }

  return secondsToTime(nextOccurrenceSeconds)
}