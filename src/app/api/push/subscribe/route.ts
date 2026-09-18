import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body?.type !== 'iphone') {
      return NextResponse.json(
        {
          errors: ['type must be iphone'],
        },
        { status: 400 }
      )
    }

    const subscription = body?.subscription

    if (
      !subscription ||
      typeof subscription.endpoint !== 'string' ||
      !subscription.keys ||
      typeof subscription.keys.p256dh !== 'string' ||
      typeof subscription.keys.auth !== 'string'
    ) {
      return NextResponse.json(
        {
          errors: ['Invalid push subscription'],
        },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data: existingDevice, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('type', 'iphone')
      .maybeSingle()

    if (deviceError) {
      console.error(deviceError)

      return NextResponse.json(
        { error: 'Failed to find iPhone device' },
        { status: 500 }
      )
    }

    let device = existingDevice

    if (!device) {
      const { data: newDevice, error: createError } = await supabase
        .from('devices')
        .insert({
          type: 'iphone',
          name: 'iPhone',
        })
        .select('*')
        .single()

      if (createError) {
        console.error(createError)

        return NextResponse.json(
          { error: 'Failed to create iPhone device' },
          { status: 500 }
        )
      }

      device = newDevice
    }

    const { data: savedSubscription, error: subscriptionError } =
      await supabase
        .from('push_subscriptions')
        .insert({
          device_id: device.id,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        })
        .select('*')
        .single()

    if (subscriptionError) {
      console.error(subscriptionError)

      return NextResponse.json(
        { error: 'Failed to save push subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        device: {
          id: device.id,
          type: device.type,
          name: device.name,
        },
        subscription: {
          id: savedSubscription.id,
          endpoint: savedSubscription.endpoint,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}