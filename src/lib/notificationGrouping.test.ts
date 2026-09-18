import { describe, expect, it } from 'vitest'
import {
  groupNotifications,
  ScheduledReminder,
} from './notificationGrouping'

function createReminder(id: number, name: string) {
  return {
    id,
    name,
    startTime: '09:00',
    endTime: '22:00',
    interval: 20,
    enabled: true,
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  }
}

describe('groupNotifications', () => {
  it('returns empty array for empty input', () => {
    expect(groupNotifications([])).toEqual([])
  })

  it('creates one group for one reminder', () => {
    const eyeExercise = createReminder(1, 'Eye Exercise')

    const input: ScheduledReminder[] = [
      {
        reminder: eyeExercise,
        scheduledTime: '09:20',
      },
    ]

    expect(groupNotifications(input)).toEqual([
      {
        scheduledTime: '09:20',
        reminders: [eyeExercise],
      },
    ])
  })

  it('keeps reminders with different times in separate groups', () => {
    const eyeExercise = createReminder(1, 'Eye Exercise')
    const stretch = createReminder(2, 'Stretch')

    const input: ScheduledReminder[] = [
      {
        reminder: eyeExercise,
        scheduledTime: '09:20',
      },
      {
        reminder: stretch,
        scheduledTime: '10:00',
      },
    ]

    expect(groupNotifications(input)).toEqual([
      {
        scheduledTime: '09:20',
        reminders: [eyeExercise],
      },
      {
        scheduledTime: '10:00',
        reminders: [stretch],
      },
    ])
  })

  it('groups reminders with the same scheduled time', () => {
    const eyeExercise = createReminder(1, 'Eye Exercise')
    const drinkWater = createReminder(2, 'Drink Water')

    const input: ScheduledReminder[] = [
      {
        reminder: eyeExercise,
        scheduledTime: '09:20',
      },
      {
        reminder: drinkWater,
        scheduledTime: '09:20',
      },
    ]

    expect(groupNotifications(input)).toEqual([
      {
        scheduledTime: '09:20',
        reminders: [eyeExercise, drinkWater],
      },
    ])
  })

  it('groups multiple reminders with the same time', () => {
    const reminder1 = createReminder(1, 'Eye Exercise')
    const reminder2 = createReminder(2, 'Drink Water')
    const reminder3 = createReminder(3, 'Stretch')

    const input: ScheduledReminder[] = [
      {
        reminder: reminder1,
        scheduledTime: '09:20',
      },
      {
        reminder: reminder2,
        scheduledTime: '09:20',
      },
      {
        reminder: reminder3,
        scheduledTime: '09:20',
      },
    ]

    expect(groupNotifications(input)).toEqual([
      {
        scheduledTime: '09:20',
        reminders: [reminder1, reminder2, reminder3],
      },
    ])
  })

  it('preserves the order of reminders', () => {
    const first = createReminder(1, 'First')
    const second = createReminder(2, 'Second')
    const third = createReminder(3, 'Third')

    const input: ScheduledReminder[] = [
      {
        reminder: first,
        scheduledTime: '09:20',
      },
      {
        reminder: second,
        scheduledTime: '10:00',
      },
      {
        reminder: third,
        scheduledTime: '09:20',
      },
    ]

    expect(groupNotifications(input)).toEqual([
      {
        scheduledTime: '09:20',
        reminders: [first, third],
      },
      {
        scheduledTime: '10:00',
        reminders: [second],
      },
    ])
  })
})