import { describe, expect, it } from 'vitest'
import {
  getDailyOccurrences,
  getNextOccurrence,
} from './scheduler'
import { Reminder } from '@/types/reminder'

const reminder: Reminder = {
  id: 1,
  name: 'Eye Exercise',
  startTime: '09:00',
  endTime: '10:00',
  interval: 20,
  enabled: true,
  createdAt: '',
  updatedAt: '',
}

describe('getDailyOccurrences', () => {
  it('generates occurrences including End', () => {
    expect(getDailyOccurrences(reminder)).toEqual([
      '09:00',
      '09:20',
      '09:40',
      '10:00',
    ])
  })

  it('returns empty array for disabled reminder', () => {
    expect(
      getDailyOccurrences({
        ...reminder,
        enabled: false,
      })
    ).toEqual([])
  })

  it('works when Start and End are equal', () => {
    expect(
      getDailyOccurrences({
        ...reminder,
        startTime: '09:00',
        endTime: '09:00',
      })
    ).toEqual(['09:00'])
  })

  it('does not generate occurrence after End', () => {
    expect(
      getDailyOccurrences({
        ...reminder,
        startTime: '09:00',
        endTime: '09:50',
      })
    ).toEqual([
      '09:00',
      '09:20',
      '09:40',
    ])
  })
})

describe('getNextOccurrence', () => {
  it('returns Start when current time is before Start', () => {
    expect(
      getNextOccurrence('08:30', reminder)
    ).toBe('09:00')
  })

  it('returns current occurrence when time matches exactly', () => {
    expect(
      getNextOccurrence('09:20', reminder)
    ).toBe('09:20')
  })

  it('returns next occurrence between intervals', () => {
    expect(
      getNextOccurrence('09:13', reminder)
    ).toBe('09:20')
  })

  it('does not return an occurrence that already passed', () => {
    expect(
      getNextOccurrence('09:20:30', reminder)
    ).toBe('09:40')
  })

  it('returns End when current time equals End', () => {
    expect(
      getNextOccurrence('10:00', reminder)
    ).toBe('10:00')
  })

  it('returns null after End', () => {
    expect(
      getNextOccurrence('10:01', reminder)
    ).toBeNull()
  })

  it('returns null for disabled reminder', () => {
    expect(
      getNextOccurrence('09:20', {
        ...reminder,
        enabled: false,
      })
    ).toBeNull()
  })

  it('keeps interval anchored to Start', () => {
    const testReminder: Reminder = {
      ...reminder,
      startTime: '09:00',
      endTime: '15:00',
      interval: 20,
    }

    expect(
      getNextOccurrence('15:13', testReminder)
    ).toBeNull()

    expect(
      getNextOccurrence('14:59', testReminder)
    ).toBe('15:00')
  })
})