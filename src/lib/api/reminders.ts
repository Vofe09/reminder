import { Reminder } from '@/types/reminder'

type ReminderInput = {
  name: string
  startTime: string
  endTime: string
  interval: number
}

export async function getReminders(): Promise<Reminder[]> {
  const response = await fetch('/api/reminders', {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load reminders')
  }

  const data = await response.json()

  return data.reminders
}

export async function createReminder(
  data: ReminderInput
): Promise<Reminder> {
  const response = await fetch('/api/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const result = await response.json()
    throw new Error(result.error ?? 'Failed to create reminder')
  }

  return response.json()
}

export async function updateReminder(
  id: number,
  data: ReminderInput
): Promise<Reminder> {
  const response = await fetch(`/api/reminders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const result = await response.json()
    throw new Error(result.error ?? 'Failed to update reminder')
  }

  return response.json()
}

export async function deleteReminder(id: number): Promise<void> {
  const response = await fetch(`/api/reminders/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete reminder')
  }
}

export async function enableReminder(id: number): Promise<Reminder> {
  const response = await fetch(`/api/reminders/${id}/enable`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to enable reminder')
  }

  return response.json()
}

export async function disableReminder(id: number): Promise<Reminder> {
  const response = await fetch(`/api/reminders/${id}/disable`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to disable reminder')
  }

  return response.json()
}