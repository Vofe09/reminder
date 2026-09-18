import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  mapReminder,
  validateReminderInput,
} from '@/lib/reminders'

export async function GET() {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    reminders: data.map(mapReminder),
  })
}

export async function POST(request: Request) {
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
    .insert({
      name: validation.data.name,
      start_time: validation.data.startTime,
      end_time: validation.data.endTime,
      interval_value: validation.data.interval,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    mapReminder(data),
    { status: 201 }
  )
}