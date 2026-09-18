import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  const reminders = data.map((reminder) => ({
    id: reminder.id,
    name: reminder.name,
    startTime: reminder.start_time,
    endTime: reminder.end_time,
    interval: reminder.interval_value,
    enabled: reminder.enabled,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at,
  }))

  return NextResponse.json({
    reminders,
  })
}