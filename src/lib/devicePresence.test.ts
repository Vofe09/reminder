import { describe, expect, it } from 'vitest'
import { isDeviceActive } from './devicePresence'

describe('isDeviceActive', () => {
  const currentTime = '2026-09-18T12:00:00.000Z'

  it('returns false when lastSeen is null', () => {
    expect(
      isDeviceActive(null, currentTime)
    ).toBe(false)
  })

  it('returns true when heartbeat was received recently', () => {
    expect(
      isDeviceActive(
        '2026-09-18T11:55:00.000Z',
        currentTime
      )
    ).toBe(true)
  })

  it('returns true when less than 10 minutes have passed', () => {
    expect(
      isDeviceActive(
        '2026-09-18T11:50:01.000Z',
        currentTime
      )
    ).toBe(true)
  })

  it('returns false when exactly 10 minutes have passed', () => {
    expect(
      isDeviceActive(
        '2026-09-18T11:50:00.000Z',
        currentTime
      )
    ).toBe(false)
  })

  it('returns false when more than 10 minutes have passed', () => {
    expect(
      isDeviceActive(
        '2026-09-18T11:49:59.000Z',
        currentTime
      )
    ).toBe(false)
  })
})