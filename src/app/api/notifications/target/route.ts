import { NextResponse } from 'next/server'
import { determineNotificationTarget } from '@/lib/notificationRouter'

export async function GET() {
  try {
    const target = await determineNotificationTarget()

    return NextResponse.json({
      target,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to determine notification target' },
      { status: 500 }
    )
  }
}