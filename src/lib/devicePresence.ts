const INACTIVITY_THRESHOLD_MS = 10 * 60 * 1000

export function isDeviceActive(
  lastSeen: string | null,
  currentTime: string
): boolean {
  if (!lastSeen) return false

  const lastSeenTime = new Date(lastSeen).getTime()
  const currentTimeValue = new Date(currentTime).getTime()

  return (
    currentTimeValue - lastSeenTime <
    INACTIVITY_THRESHOLD_MS
  )
}