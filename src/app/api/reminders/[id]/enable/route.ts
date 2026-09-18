import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapReminder } from '@/lib/reminders'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params
  const reminderId = Number(id)

  if (!Number.isInteger(reminderId) || reminderId < 1) {
    return NextResponse.json(
      {
        errors: ['Invalid reminder id'],
      },
      { status: 400 }
    )
  }

  const { data, error } = await createSupabaseServerClient()
    .from('reminders')
    .update({
      enabled: true,
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