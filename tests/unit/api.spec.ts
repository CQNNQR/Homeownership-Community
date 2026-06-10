/**
 * Unit tests for the shared API helpers.
 *
 * Run with:
 *   npm run test:unit
 */
import { test, expect } from '@playwright/test'
import { parsePartial, ok, err, assertAffected } from '../../src/lib/api'

test.describe('parsePartial', () => {
  test('keeps only allowed keys and drops undefined', () => {
    const result = parsePartial<{ name?: string; email?: string }>(
      { name: 'Jane', email: 'jane@x.com', password: 'hax', role: 'admin' },
      ['name', 'email'],
    )
    expect(result.patch).toEqual({ name: 'Jane', email: 'jane@x.com' })
    expect(result.ignored).toEqual(['password', 'role'])
  })

  test('returns empty patch + reason for non-object body', () => {
    expect(parsePartial('hello', ['x'])).toEqual({ patch: {}, ignored: [], reason: 'body-not-object' })
    expect(parsePartial(null, ['x'])).toEqual({ patch: {}, ignored: [], reason: 'body-not-object' })
    expect(parsePartial([1, 2, 3], ['x'])).toEqual({ patch: {}, ignored: [], reason: 'body-not-object' })
  })

  test('preserves falsy values (0, false, "")', () => {
    const result = parsePartial<{ count?: number; flag?: boolean; tag?: string }>(
      { count: 0, flag: false, tag: '' },
      ['count', 'flag', 'tag'],
    )
    expect(result.patch).toEqual({ count: 0, flag: false, tag: '' })
  })
})

test.describe('ok / err envelopes', () => {
  test('ok wraps data and optional message', async () => {
    const res = ok({ id: 1 }, 'created')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ data: { id: 1 }, message: 'created' })
  })

  test('err wraps code + message + status + details', async () => {
    const res = err('not_found', 'Book not found', 404, { id: 'abc' })
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ error: { code: 'not_found', message: 'Book not found', details: { id: 'abc' } } })
  })
})

test.describe('assertAffected', () => {
  test('returns 404 when data is null', async () => {
    const r = assertAffected(null as any, null, 'Book')
    expect(r.error).not.toBeNull()
    expect(r.error!.status).toBe(404)
  })

  test('returns 404 when data is empty array', async () => {
    const r = assertAffected([] as any, null, 'Book')
    expect(r.error).not.toBeNull()
    expect(r.error!.status).toBe(404)
  })

  test('returns internal error when Supabase errored', async () => {
    const r = assertAffected(null, { message: 'oops', code: '42P01' })
    expect(r.error).not.toBeNull()
    expect(r.error!.status).toBe(500)
  })

  test('returns data when present', () => {
    const r = assertAffected({ id: 'a' }, null, 'Book')
    expect(r.error).toBeNull()
    expect(r.data).toEqual({ id: 'a' })
  })
})
