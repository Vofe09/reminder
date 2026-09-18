export type NotificationTarget = 'desktop' | 'iphone'

export function getNotificationTarget(
  desktopActive: boolean
): NotificationTarget {
  if (desktopActive) {
    return 'desktop'
  }

  return 'iphone'
}