import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isDeviceActive } from './devicePresence'

export async function isDesktopActive(): Promise<boolean> {
  const supabase = createSupabaseServerClient()

  const { data: devices, error } = await supabase
    .from('devices')
    .select('last_seen')
    .in('type', ['linux', 'windows'])

  if (error) {
    throw new Error('Failed to load desktop presence')
  }

  const currentTime = new Date().toISOString()

  return devices.some((device) =>
    isDeviceActive(device.last_seen, currentTime)
  )
}