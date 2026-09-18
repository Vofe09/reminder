export function createOccurrenceKey(
  date: string,
  scheduledTime: string,
  reminderIds: number[]
): string {
  const sortedIds = [...reminderIds].sort(
    (a, b) => a - b
  )

  return `${date}_${scheduledTime}_${sortedIds.join('-')}`
}

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function hasNotificationEvent(
  occurrenceKey: string
): Promise<boolean> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notification_events')
    .select('id')
    .eq('occurrence_key', occurrenceKey)
    .maybeSingle()

  if (error) {
    throw new Error(
      'Failed to check notification event'
    )
  }

  return Boolean(data)
}

export async function createNotificationEvent(
  occurrenceKey: string,
  reminderIds: number[],
  scheduledAt: string,
  target: string
) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notification_events')
    .insert({
      occurrence_key: occurrenceKey,
      reminder_ids: reminderIds,
      scheduled_at: scheduledAt,
      target,
      status: 'sent',
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(
      'Failed to create notification event'
    )
  }

  return data
}