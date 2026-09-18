import { createSupabaseServerClient } from '@/lib/supabase/server'
import { webpush } from './push'
import { NotificationGroup } from './notificationGrouping'

export async function sendIphoneNotification(
  group: NotificationGroup
) {
  const supabase = createSupabaseServerClient()

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id')
    .eq('type', 'iphone')
    .maybeSingle()

  if (deviceError) {
    throw new Error('Failed to find iPhone device')
  }

  if (!device) {
    return {
      sent: 0,
      removed: 0,
    }
  }

  const { data: subscriptions, error: subscriptionsError } =
    await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('device_id', device.id)

  if (subscriptionsError) {
    throw new Error('Failed to load push subscriptions')
  }

  if (!subscriptions || subscriptions.length === 0) {
    return {
      sent: 0,
      removed: 0,
    }
  }

  const reminderNames = group.reminders
    .map((reminder) => reminder.name)
    .join(' + ')

  const payload = JSON.stringify({
    title: reminderNames,
    body: `Reminder at ${group.scheduledTime}`,
  })

  let sent = 0
  let removed = 0

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload
      )

      sent++
    } catch (error: any) {
      console.error(
        `Failed to send subscription ${subscription.id}`,
        error
      )

      if (
        error?.statusCode === 404 ||
        error?.statusCode === 410
      ) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', subscription.id)

        removed++
      }
    }
  }

  return {
    sent,
    removed,
  }
}