import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { webpush } from '@/lib/push'

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()

    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('type', 'iphone')
      .maybeSingle()

    if (deviceError) {
      console.error(deviceError)

      return NextResponse.json(
        { error: 'Failed to find iPhone device' },
        { status: 500 }
      )
    }

    if (!device) {
      return NextResponse.json(
        { error: 'iPhone device is not registered' },
        { status: 404 }
      )
    }

    const { data: subscriptions, error: subscriptionsError } =
      await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('device_id', device.id)

    if (subscriptionsError) {
      console.error(subscriptionsError)

      return NextResponse.json(
        { error: 'Failed to load push subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found' },
        { status: 404 }
      )
    }

    const payload = JSON.stringify({
      title: 'Universal Reminder',
      body: 'Test notification works.',
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
          `Failed to send push to subscription ${subscription.id}`,
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

    return NextResponse.json({
      success: true,
      sent,
      removed,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}