import { Reminder } from '@/types/reminder'

export type ScheduledReminder = {
  reminder: Reminder
  scheduledTime: string
}

export type NotificationGroup = {
  scheduledTime: string
  reminders: Reminder[]
}

export function groupNotifications(
  scheduledReminders: ScheduledReminder[]
): NotificationGroup[] {
  const groups = new Map<string, Reminder[]>()

  for (const { reminder, scheduledTime } of scheduledReminders) {
    const existingGroup = groups.get(scheduledTime)

    if (existingGroup) {
      existingGroup.push(reminder)
    } else {
      groups.set(scheduledTime, [reminder])
    }
  }

  return Array.from(groups.entries()).map(
    ([scheduledTime, reminders]) => ({
      scheduledTime,
      reminders,
    })
  )
}