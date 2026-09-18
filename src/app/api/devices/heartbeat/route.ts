import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const DEVICE_TYPES = ['linux', 'windows'] as const

type DeviceType = (typeof DEVICE_TYPES)[number]

function isValidDeviceType(value: unknown): value is DeviceType {
  return typeof value === 'string' && DEVICE_TYPES.includes(value as DeviceType)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isValidDeviceType(body?.type)) {
      return NextResponse.json(
        {
          errors: ['type must be either linux or windows'],
        },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data: existingDevice, error: findError } = await supabase
      .from('devices')
      .select('*')
      .eq('type', body.type)
      .maybeSingle()

    if (findError) {
      console.error(findError)

      return NextResponse.json(
        { error: 'Failed to find device' },
        { status: 500 }
      )
    }

    if (!existingDevice) {
      const { data: newDevice, error: createError } = await supabase
        .from('devices')
        .insert({
          type: body.type,
          name: `${body.type} desktop`,
          last_seen: new Date().toISOString(),
        })
        .select('*')
        .single()

      if (createError) {
        console.error(createError)

        return NextResponse.json(
          { error: 'Failed to create device' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        device: {
          id: newDevice.id,
          type: newDevice.type,
          name: newDevice.name,
          lastSeen: newDevice.last_seen,
        },
        active: true,
      })
    }

    const { data: updatedDevice, error: updateError } = await supabase
      .from('devices')
      .update({
        last_seen: new Date().toISOString(),
      })
      .eq('id', existingDevice.id)
      .select('*')
      .single()

    if (updateError) {
      console.error(updateError)

      return NextResponse.json(
        { error: 'Failed to update device heartbeat' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      device: {
        id: updatedDevice.id,
        type: updatedDevice.type,
        name: updatedDevice.name,
        lastSeen: updatedDevice.last_seen,
      },
      active: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
}