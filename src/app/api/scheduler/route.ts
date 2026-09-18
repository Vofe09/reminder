import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapReminder } from '@/lib/reminders'
import { getDueReminders } from '@/lib/schedulerRunner'
import { groupNotifications } from '@/lib/notificationGrouping'
import { determineNotificationTarget } from '@/lib/notificationRouter'
import { sendIphoneNotification } from '@/lib/notificationSender'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('enabled', true)
      .order('start_time', { ascending: true })

    if (error) {
      console.error(error)

      return NextResponse.json(
        { error: 'Failed to load reminders' },
        { status: 500 }
      )
    }

    const reminders = data.map(mapReminder)

    const currentTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    }).format(new Date())

    const dueReminders = getDueReminders(
      reminders,
      currentTime
    )

    if (dueReminders.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: 'No reminders due',
      })
    }

    const groups = groupNotifications(
      dueReminders
    )

    const target =
      await determineNotificationTarget()

    const results = []

    for (const group of groups) {
      if (target === 'iphone') {
        const result =
          await sendIphoneNotification(group)

        results.push({
          scheduledTime: group.scheduledTime,
          reminders: group.reminders.map(
            (reminder) => reminder.name
          ),
          target,
          ...result,
        })
      } else {
        results.push({
          scheduledTime: group.scheduledTime,
          reminders: group.reminders.map(
            (reminder) => reminder.name
          ),
          target,
        })
      }
    }

    return NextResponse.json({
      processed: groups.length,
      target,
      results,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Scheduler failed' },
      { status: 500 }
    )
  }
}