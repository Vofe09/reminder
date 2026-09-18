import { Reminder } from '@/types/reminder'
import {
  ScheduledReminder,
} from './notificationGrouping'
import {
  getNextOccurrence,
} from './scheduler'

export function getDueReminders(
  reminders: Reminder[],
  currentTime: string
): ScheduledReminder[] {
  const result: ScheduledReminder[] = []

  for (const reminder of reminders) {
    const occurrence = getNextOccurrence(
      currentTime,
      reminder
    )

    if (occurrence === currentTime) {
      result.push({
        reminder,
        scheduledTime: occurrence,
      })
    }
  }

  return result
}