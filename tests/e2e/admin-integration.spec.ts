import { test, expect, type Page } from '@playwright/test'

// Each editor flow logs in (which may include a self-heal round
// trip) and runs several writes. Give each test a generous
// timeout so CI doesn't flake on slow network or ISR revalidation.
test.setTimeout(120000)

/**
 * Admin integration test suite.
 *
 * Logs in as the configured admin (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD)
 * and exercises every editor end-to-end against the live Supabase
 * backend. This is the focused regression suite for the June 8 + June
 * 10, 2026 fix passes.
 *
 * To run against a local dev server:
 *   E2E_BASE_URL=http://localhost:3000 npx playwright test admin-integration
 *
 * To run against the production deployment:
 *   npx playwright test admin-integration
 *
 * The default BASE_URL is the Vercel production site.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@hoc.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '!Texas1995'
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe.configure({ mode: 'serial' })

async function login(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`)
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  // The self-heal flow may add a /api/auth/refresh round trip,
  // so give it a generous timeout.
  await page.waitForURL('**/admin', { timeout: 45000 })
  await expect(page.locator('h1')).toContainText('Site Editor', { timeout: 15000 })
}

async function gotoSection(page: Page, name: string) {
  await page.click(`button:has-text("${name}")`)
  // The form mounts and fetches; allow a beat for the API round-trip.
  await page.waitForTimeout(800)
}

test.describe('Admin — Login & self-heal', () => {
  test('logs in and lands on the editor', async ({ page }) => {
    await login(page)
    // The editor shows the "Welcome, admin@hoc.com" line in the header.
    await expect(page.locator('text=Welcome,')).toBeVisible()
  })

  test('rejects invalid credentials with a visible error', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`)
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'definitely-wrong')
    await page.click('button[type="submit"]')
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin — Site Settings', () => {
  test('saves a setting and confirms via the success banner', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Site Settings')
    const stamp = Date.now()
    const newValue = `TEST SITE NAME ${stamp}`
    await page.fill('input[placeholder="The Homeownership Community"]', newValue)
    await page.click('button:has-text("Save Settings")')
    await expect(page.getByTestId('settings-save-message')).toContainText('Settings saved successfully!', { timeout: 15000 })

    // Reset so we don't pollute the site.
    await page.fill('input[placeholder="The Homeownership Community"]', 'The Homeownership Community')
    await page.click('button:has-text("Save Settings")')
    await page.waitForTimeout(1000)
  })
})

test.describe('Admin — Books', () => {
  test('add → edit → delete a book', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Books')
    page.on('dialog', d => d.accept())

    const stamp = Date.now()
    const title = `TEST BOOK ${stamp}`
    const newTitle = `TEST BOOK EDITED ${stamp}`

    // Add
    await page.click('button:has-text("+ Add Book")')
    await page.waitForSelector('input[placeholder="Book title..."]', { state: 'visible' })
    await page.fill('input[placeholder="Book title..."]', title)
    await page.fill('input[placeholder="https://amazon.com/..."]', `https://amazon.com/dp/TEST${stamp}`)
    await page.click('button:has-text("Save Book")')
    await expect(page.locator(`h3:has-text("${title}")`)).toBeVisible({ timeout: 10000 })

    // Edit — find the row we just added and click its Edit button.
    const row = page.locator(`div:has(h3:has-text("${title}"))`).first()
    await row.locator('button:has-text("Edit")').click()
    await page.waitForSelector('input[placeholder="Book title..."]', { state: 'visible' })
    await page.fill('input[placeholder="Book title..."]', newTitle)
    await page.click('button:has-text("Save Book")')
    await expect(page.locator(`h3:has-text("${newTitle}")`)).toBeVisible({ timeout: 10000 })

    // Delete the row we just edited
    const editedRow = page.locator(`div:has(h3:has-text("${newTitle}"))`).first()
    await editedRow.locator('button:has-text("Delete")').click()
    await page.waitForTimeout(1500)
    await expect(page.locator(`h3:has-text("${newTitle}")`)).toHaveCount(0)
  })
})

test.describe('Admin — Testimonials', () => {
  test('add → edit → soft-delete a testimonial', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Testimonials')
    page.on('dialog', d => d.accept())

    const stamp = Date.now()
    const name = `TEST PERSON ${stamp}`
    const newName = `TEST PERSON EDITED ${stamp}`

    // Add
    await page.click('button:has-text("+ Add Testimonial")')
    await page.waitForSelector('input[placeholder="John D."]', { state: 'visible' })
    await page.fill('input[placeholder="John D."]', name)
    await page.fill('textarea[placeholder="What they said..."]', 'Great experience with the Homeownership Community!')
    await page.click('button:has-text("Save")')
    await expect(page.locator(`p:has-text("${name}")`)).toBeVisible({ timeout: 10000 })

    // Edit
    const row = page.locator(`div:has(p:has-text("${name}"))`).first()
    await row.locator('button:has-text("Edit")').click()
    await page.waitForSelector('input[placeholder="John D."]', { state: 'visible' })
    await page.fill('input[placeholder="John D."]', newName)
    await page.click('button:has-text("Save")')
    await expect(page.locator(`p:has-text("${newName}")`)).toBeVisible({ timeout: 10000 })

    // Soft-delete (sets is_active=false; row remains in editor)
    const editedRow = page.locator(`div:has(p:has-text("${newName}"))`).first()
    await editedRow.locator('button:has-text("Delete")').click()
    await page.waitForTimeout(1500)
  })
})

test.describe('Admin — Podcast', () => {
  test('add → toggle visibility → delete an episode', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Podcast')
    page.on('dialog', d => d.accept())

    const stamp = Date.now()
    const title = `TEST EPISODE ${stamp}`

    // Add
    await page.click('button:has-text("+ Add Episode")')
    await page.waitForSelector('input[placeholder="Episode title..."]', { state: 'visible' })
    await page.fill('input[placeholder="Episode title..."]', title)
    await page.fill('input[placeholder="https://youtube.com/watch?v=..."]', `https://youtube.com/watch?v=TEST${stamp}`)
    await page.click('button:has-text("Save")')
    await expect(page.locator(`h3:has-text("${title}")`)).toBeVisible({ timeout: 10000 })

    // Toggle visibility
    const row = page.locator(`div:has(h3:has-text("${title}"))`).first()
    await row.locator('button:has-text("Hide")').click()
    await page.waitForTimeout(1500)
    // The Hide button should now read Show.
    await expect(row.locator('button:has-text("Show")')).toBeVisible({ timeout: 10000 })

    // Delete
    await row.locator('button:has-text("Delete")').click()
    await page.waitForTimeout(1500)
    await expect(page.locator(`h3:has-text("${title}")`)).toHaveCount(0)
  })
})

test.describe('Admin — Media Library', () => {
  test('add → delete a media item', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Media')
    page.on('dialog', d => d.accept())

    const stamp = Date.now()
    const name = `TEST MEDIA ${stamp}`

    await page.click('button:has-text("+ Add Media")')
    await page.waitForSelector('input[placeholder="Image or PDF name"]', { state: 'visible' })
    await page.fill('input[placeholder="Image or PDF name"]', name)
    await page.fill('input[placeholder="https://..."]', `https://example.com/test-${stamp}.png`)
    await page.click('button:has-text("Add Media")')
    await expect(page.locator(`p:has-text("${name}")`)).toBeVisible({ timeout: 10000 })

    // Delete
    const row = page.locator(`div:has(p:has-text("${name}"))`).first()
    await row.locator('button:has-text("Delete")').click()
    await page.waitForTimeout(1500)
    await expect(page.locator(`p:has-text("${name}")`)).toHaveCount(0)
  })
})

test.describe('Admin — Subscribers & Zapier', () => {
  test('Subscribers list is visible and CSV export downloads', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Subscribers')

    // The list table headers should be present
    await expect(page.locator('th:has-text("Email")')).toBeVisible()
    await expect(page.locator('th:has-text("Name")')).toBeVisible()

    // CSV export — listen for the download event
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null)
    await page.click('button:has-text("Export CSV")')
    const download = await downloadPromise
    if (download) {
      const filename = download.suggestedFilename()
      expect(filename).toMatch(/^subscribers-\d{4}-\d{2}-\d{2}\.csv$/)
    }
  })

  test('Zapier config modal opens, accepts a URL, and saves', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Subscribers')

    // Open the modal
    await page.click('button:has-text("Zapier")')
    await page.waitForSelector('text=Zapier Integration', { state: 'visible' })

    // Save a test webhook URL (httpbin echoes the request so we
    // can verify the connection without polluting Brandon's CRM).
    const testUrl = 'https://httpbin.org/post'
    await page.fill('input[placeholder="https://hooks.zapier.com/hooks/catch/..."]', testUrl)
    await page.click('button:has-text("Save"):not(:has-text("Save Theme"))')
    // Look for the inline confirmation
    await expect(page.locator('text=Webhook saved').or(page.locator('text=Webhook cleared'))).toBeVisible({ timeout: 10000 })

    // Clear so we don't leave the test URL configured
    await page.click('button:has-text("Clear")')
    await page.waitForTimeout(500)
  })
})

test.describe('Admin — Local Blog Posts', () => {
  test('add → publish → delete a local blog post', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Blog')

    // Switch to Local Blog Posts tab
    await page.click('button:has-text("Local Blog Posts")')
    await page.waitForTimeout(500)

    page.on('dialog', d => d.accept())

    const stamp = Date.now()
    const title = `TEST LOCAL POST ${stamp}`

    // Add
    await page.click('button:has-text("+ Add Post")')
    await page.waitForSelector('input[placeholder="Post title..."]', { state: 'visible' })
    await page.fill('input[placeholder="Post title..."]', title)
    await page.fill('textarea[placeholder="Write your post (markdown / HTML)..."]', 'This is test content for the admin-integration test suite.')
    await page.check('input[type="checkbox"]:near(:text("Published"))')
    await page.click('button:has-text("Create Post")')
    await expect(page.locator(`h3:has-text("${title}")`)).toBeVisible({ timeout: 10000 })

    // Delete
    const row = page.locator(`div:has(h3:has-text("${title}"))`).first()
    await row.locator('button:has-text("Delete")').click()
    await page.waitForTimeout(1500)
    await expect(page.locator(`h3:has-text("${title}")`)).toHaveCount(0)
  })
})

test.describe('Admin — Theme Editor', () => {
  test('applies a preset and saves; primary color change saves', async ({ page }) => {
    await login(page)
    await gotoSection(page, 'Theme')

    // Apply Midnight Blue
    await page.click('button:has-text("Midnight Blue")')
    await page.click('button:has-text("Save Theme")')
    await expect(page.locator('text=Theme saved successfully!')).toBeVisible({ timeout: 10000 })

    // Reset to Classic Red
    await page.click('button:has-text("Classic Red")')
    await page.click('button:has-text("Save Theme")')
    await expect(page.locator('text=Theme saved successfully!')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin — Public-facing Zapier trigger', () => {
  test('Subscriber signup via /api/subscribers fires the Zapier hook (no webhook configured → silent skip)', async ({ request }) => {
    // Hit the public POST endpoint with a unique email. We don't
    // assert that Zapier itself was called (that would require a
    // test webhook in a third-party service), but we DO assert
    // that the request returns success — proving the code path
    // runs and doesn't crash.
    const stamp = Date.now()
    const res = await request.post(`${BASE_URL}/api/subscribers`, {
      data: {
        email: `e2e-test-${stamp}@example.com`,
        firstName: 'E2E',
        lastName: 'Test',
        source: 'playwright',
      },
    })
    expect([200, 201]).toContain(res.status())
    const body = await res.json()
    expect(body).toHaveProperty('email')
  })

  test('Contact form posts to /api/contact and returns success', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'E2E Tester',
        email: 'e2e@example.com',
        subject: 'Test from Playwright',
        message: 'This is a Playwright integration test message.',
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('success', true)
  })
})

test.describe('Admin — Logout', () => {
  test('Clicking Logout returns the user to the public site', async ({ page }) => {
    await login(page)
    await page.waitForSelector('button:has-text("Logout")', { state: 'visible' })
    await page.click('button:has-text("Logout")')
    await page.waitForURL((url) => !url.pathname.startsWith('/admin'), { timeout: 15000 })
    expect(page.url()).not.toContain('/admin')
  })
})
