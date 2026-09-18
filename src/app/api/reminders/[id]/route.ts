import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  mapReminder,
  validateReminderInput,
} from '@/lib/reminders'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseId(id: string): number | null {
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params
  const reminderId = parseId(id)

  if (reminderId === null) {
    return NextResponse.json(
      {
        errors: ['Invalid reminder id'],
      },
      { status: 400 }
    )
  }

  const { data, error } = await createSupabaseServerClient()
    .from('reminders')
    .select('*')
    .eq('id', reminderId)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      {
        error: 'Reminder not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(mapReminder(data))
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params
  const reminderId = parseId(id)

  if (reminderId === null) {
    return NextResponse.json(
      {
        errors: ['Invalid reminder id'],
      },
      { status: 400 }
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        errors: ['Request body must contain valid JSON'],
      },
      { status: 400 }
    )
  }

  const validation = validateReminderInput(body)

  if ('errors' in validation) {
    return NextResponse.json(
      {
        errors: validation.errors,
      },
      { status: 400 }
    )
  }

  const { data, error } = await createSupabaseServerClient()
    .from('reminders')
    .update({
      name: validation.data.name,
      start_time: validation.data.startTime,
      end_time: validation.data.endTime,
      interval_value: validation.data.interval,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reminderId)
    .select('*')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      {
        error: 'Reminder not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(mapReminder(data))
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params
  const reminderId = parseId(id)

  if (reminderId === null) {
    return NextResponse.json(
      {
        errors: ['Invalid reminder id'],
      },
      { status: 400 }
    )
  }

  const { data, error } = await createSupabaseServerClient()
    .from('reminders')
    .delete()
    .eq('id', reminderId)
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      {
        error: 'Reminder not found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    message: 'Reminder deleted successfully',
  })
}