import { describe, expect, it } from 'vitest'
import { createOccurrenceKey } from './notificationIdempotency'

describe('createOccurrenceKey', () => {
  it('creates a key for one reminder', () => {
    expect(
      createOccurrenceKey(
        '2026-09-18',
        '09:20',
        [1]
      )
    ).toBe(
      '2026-09-18_09:20_1'
    )
  })

  it('creates a key for multiple reminders', () => {
    expect(
      createOccurrenceKey(
        '2026-09-18',
        '09:20',
        [1, 2]
      )
    ).toBe(
      '2026-09-18_09:20_1-2'
    )
  })

  it('keeps the same key regardless of reminder order', () => {
    const firstKey = createOccurrenceKey(
      '2026-09-18',
      '09:20',
      [1, 2]
    )

    const secondKey = createOccurrenceKey(
      '2026-09-18',
      '09:20',
      [2, 1]
    )

    expect(firstKey).toBe(secondKey)
  })

  it('creates different keys for different times', () => {
    const firstKey = createOccurrenceKey(
      '2026-09-18',
      '09:20',
      [1]
    )

    const secondKey = createOccurrenceKey(
      '2026-09-18',
      '09:40',
      [1]
    )

    expect(firstKey).not.toBe(secondKey)
  })

  it('creates different keys for different dates', () => {
    const firstKey = createOccurrenceKey(
      '2026-09-18',
      '09:20',
      [1]
    )

    const secondKey = createOccurrenceKey(
      '2026-09-19',
      '09:20',
      [1]
    )

    expect(firstKey).not.toBe(secondKey)
  })
})