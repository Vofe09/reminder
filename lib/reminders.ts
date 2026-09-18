import { Reminder } from '@/types/reminder'

export type ReminderInput = {
  name: string
  startTime: string
  endTime: string
  interval: number
}

export function mapReminder(reminder: any): Reminder {
  return {
    id: reminder.id,
    name: reminder.name,
    startTime: reminder.start_time,
    endTime: reminder.end_time,
    interval: reminder.interval_value,
    enabled: reminder.enabled,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at,
  }
}

export function validateReminderInput(
  input: unknown
): { data: ReminderInput } | { errors: string[] } {
  if (!input || typeof input !== 'object') {
    return {
      errors: ['Request body must be a JSON object'],
    }
  }

  const body = input as Record<string, unknown>
  const errors: string[] = []

  if (
    typeof body.name !== 'string' ||
    body.name.trim().length === 0
  ) {
    errors.push('name is required')
  }

  if (
    typeof body.startTime !== 'string' ||
    !isValidTime(body.startTime)
  ) {
    errors.push('startTime must use HH:MM format')
  }

  if (
    typeof body.endTime !== 'string' ||
    !isValidTime(body.endTime)
  ) {
    errors.push('endTime must use HH:MM format')
  }

  if (
    typeof body.interval !== 'number' ||
    !Number.isInteger(body.interval) ||
    body.interval < 1
  ) {
    errors.push('interval must be an integer greater than or equal to 1')
  }

  if (
    typeof body.startTime === 'string' &&
    typeof body.endTime === 'string' &&
    isValidTime(body.startTime) &&
    isValidTime(body.endTime) &&
    body.endTime < body.startTime
  ) {
    errors.push('endTime must be greater than or equal to startTime')
  }

  if (errors.length > 0) {
    return { errors }
  }

  return {
    data: {
      name: body.name.trim(),
      startTime: body.startTime,
      endTime: body.endTime,
      interval: body.interval,
    },
  }
}

function isValidTime(value: string): boolean {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)

  return match
}