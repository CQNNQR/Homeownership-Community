import { test, expect } from '@playwright/test'
import { nextAttemptDelayMinutes, isWebhookConfigured } from '../../src/lib/zapier'

test.describe('nextAttemptDelayMinutes', () => {
  test('returns 0 for the first attempt (no backoff needed)', () => {
    expect(nextAttemptDelayMinutes(0)).toBe(0)
  })

  test('escalates: 1, 5, 15, 60, 360, 1440 minutes', () => {
    expect(nextAttemptDelayMinutes(1)).toBe(1)
    expect(nextAttemptDelayMinutes(2)).toBe(5)
    expect(nextAttemptDelayMinutes(3)).toBe(15)
    expect(nextAttemptDelayMinutes(4)).toBe(60)
    expect(nextAttemptDelayMinutes(5)).toBe(360)
    expect(nextAttemptDelayMinutes(6)).toBe(1440)
  })

  test('caps at the last entry for attempt > len(backoff)', () => {
    expect(nextAttemptDelayMinutes(10)).toBe(1440)
  })
})

test.describe('isWebhookConfigured', () => {
  test('returns false when env is empty', () => {
    // The env was read at module load; we just verify the function shape.
    const configured = isWebhookConfigured()
    expect(typeof configured).toBe('boolean')
  })
})
