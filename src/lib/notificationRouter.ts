import {
  getNotificationTarget,
  NotificationTarget,
} from './notificationRouting'
import { isDesktopActive } from './devicePresenceServer'

export async function determineNotificationTarget(): Promise<NotificationTarget> {
  const desktopActive = await isDesktopActive()

  return getNotificationTarget(desktopActive)
}