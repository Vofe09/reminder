import { describe, expect, it } from 'vitest'
import { getNotificationTarget } from './notificationRouting'

describe('getNotificationTarget', () => {
  it('routes to desktop when desktop is active', () => {
    expect(
      getNotificationTarget(true)
    ).toBe('desktop')
  })

  it('routes to iPhone when desktop is inactive', () => {
    expect(
      getNotificationTarget(false)
    ).toBe('iphone')
  })
})