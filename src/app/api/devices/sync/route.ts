import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapReminder } from '@/lib/reminders'

const DEVICE_TYPES = ['linux', 'windows'] as const

function isValidDeviceType(
  value: string | null
): boolean {
  return value !== null && DEVICE_TYPES.includes(
    value as (typeof DEVICE_TYPES)[number]
  )
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')

  if (!isValidDeviceType(type)) {
    return NextResponse.json(
      {
        errors: ['type must be either linux or windows'],
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createSupabaseServerClient()

    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('type', type)
      .maybeSingle()

    if (deviceError) {
      console.error(deviceError)

      return NextResponse.json(
        { error: 'Failed to load device' },
        { status: 500 }
      )
    }

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .order('start_time', { ascending: true })

    if (remindersError) {
      console.error(remindersError)

      return NextResponse.json(
        { error: 'Failed to load reminders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      device: {
        id: device.id,
        type: device.type,
        name: device.name,
        active: device.last_seen
          ? Date.now() -
              new Date(device.last_seen).getTime() <
            10 * 60 * 1000
          : false,
        lastSeen: device.last_seen,
      },
      reminders: reminders.map(mapReminder),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to synchronize device' },
      { status: 500 }
    )
  }
}