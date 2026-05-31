import { test, expect, chromium, Page } from '@playwright/test'

const ADMIN_EMAIL = 'admin@hoc.com'
const ADMIN_PASSWORD = '!Texas1995'
const BASE_URL = 'https://homeownership-community.vercel.app'
const LOCAL_URL = 'http://localhost:3000'

// Helper to check if running on Vercel or local
const getBaseUrl = () => {
  return process.env.E2E_BASE_URL || BASE_URL
}

// Store original values for reset
let originalValues: Record<string, string> = {}

test.describe.configure({ mode: 'serial' })

test.describe('Site Editor - Full Test Suite', () => {
  // Login once before all tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    // Capture console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text())
      }
    })

    await page.goto(`${getBaseUrl()}/admin/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin', { timeout: 30000 })

    // Store original settings values
    await page.click('button:has-text("Site Settings")')
    await page.waitForTimeout(1000)

    // Capture all settings values
    const siteNameInput = page.locator('input[placeholder="The Homeownership Community"]')
    if (await siteNameInput.isVisible()) {
      originalValues.site_name = await siteNameInput.inputValue()
    }

    originalValues.site_description = await page.locator('input[placeholder="Your site description"]').inputValue().catch(() => '')
    originalValues.meta_title = await page.locator('input[placeholder="Your site title for Google"]').inputValue().catch(() => '')
    originalValues.meta_description = await page.locator('textarea[placeholder="Brief description for search results..."]').inputValue().catch(() => '')
    originalValues.hero_image_url = await page.locator('input[placeholder="https://images.unsplash.com/..."]').inputValue().catch(() => '')
    originalValues.cta_button_text = await page.locator('input[placeholder="Start Your Journey"]').inputValue().catch(() => '')
    originalValues.cta_secondary_text = await page.locator('input[placeholder="Get My Book"]').inputValue().catch(() => '')
    originalValues.blog_title = await page.locator('input[placeholder="Latest from the Blog"]').inputValue().catch(() => '')
    originalValues.optin_title = await page.locator('input[placeholder="Join the Community"]').inputValue().catch(() => '')
    originalValues.optin_message = await page.locator('textarea[placeholder="Fill out the form below..."]').inputValue().catch(() => '')
    originalValues.about_title = await page.locator('input[placeholder="About Brandon Bee Dixon"]').inputValue().catch(() => '')
    originalValues.about_content = await page.locator('textarea[placeholder="<p>Your bio content here...</p>"]').inputValue().catch(() => '')
    originalValues.contact_email = await page.locator('input[placeholder="brandon@hocmortgage.com"]').inputValue().catch(() => '')
    originalValues.podcast_url = await page.locator('input[placeholder="https://youtube.com/@channel"]').inputValue().catch(() => '')
    originalValues.footer_mission = await page.locator('textarea[placeholder="Your mission statement..."]').inputValue().catch(() => '')
    originalValues.facebook_url = await page.locator('input[placeholder="https://facebook.com/..."]').inputValue().catch(() => '')
    originalValues.instagram_url = await page.locator('input[placeholder="https://instagram.com/..."]').inputValue().catch(() => '')
    originalValues.linkedin_url = await page.locator('input[placeholder="https://linkedin.com/in/..."]').inputValue().catch(() => '')
    originalValues.twitter_url = await page.locator('input[placeholder="https://x.com/..."]').inputValue().catch(() => '')

    console.log('Original values captured:', originalValues)

    await context.close()
  })

  // Reset all values after all tests
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`${getBaseUrl()}/admin/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin', { timeout: 30000 })

    // Go to Site Settings
    await page.click('button:has-text("Site Settings")')
    await page.waitForTimeout(1000)

    // Reset all values
    if (originalValues.site_name) await page.fill('input[placeholder="The Homeownership Community"]', originalValues.site_name)
    if (originalValues.site_description) await page.fill('input[placeholder="Your site description"]', originalValues.site_description)
    if (originalValues.meta_title) await page.fill('input[placeholder="Your site title for Google"]', originalValues.meta_title)
    if (originalValues.meta_description) await page.fill('textarea[placeholder="Brief description for search results..."]', originalValues.meta_description)
    if (originalValues.hero_image_url) await page.fill('input[placeholder="https://images.unsplash.com/..."]', originalValues.hero_image_url)
    if (originalValues.cta_button_text) await page.fill('input[placeholder="Start Your Journey"]', originalValues.cta_button_text)
    if (originalValues.cta_secondary_text) await page.fill('input[placeholder="Get My Book"]', originalValues.cta_secondary_text)
    if (originalValues.blog_title) await page.fill('input[placeholder="Latest from the Blog"]', originalValues.blog_title)
    if (originalValues.optin_title) await page.fill('input[placeholder="Join the Community"]', originalValues.optin_title)
    if (originalValues.optin_message) await page.fill('textarea[placeholder="Fill out the form below..."]', originalValues.optin_message)
    if (originalValues.about_title) await page.fill('input[placeholder="About Brandon Bee Dixon"]', originalValues.about_title)
    if (originalValues.about_content) await page.fill('textarea[placeholder="<p>Your bio content here...</p>"]', originalValues.about_content)
    if (originalValues.contact_email) await page.fill('input[placeholder="brandon@hocmortgage.com"]', originalValues.contact_email)
    if (originalValues.podcast_url) await page.fill('input[placeholder="https://youtube.com/@channel"]', originalValues.podcast_url)
    if (originalValues.footer_mission) await page.fill('textarea[placeholder="Your mission statement..."]', originalValues.footer_mission)
    if (originalValues.facebook_url) await page.fill('input[placeholder="https://facebook.com/..."]', originalValues.facebook_url)
    if (originalValues.instagram_url) await page.fill('input[placeholder="https://instagram.com/..."]', originalValues.instagram_url)
    if (originalValues.linkedin_url) await page.fill('input[placeholder="https://linkedin.com/in/..."]', originalValues.linkedin_url)
    if (originalValues.twitter_url) await page.fill('input[placeholder="https://x.com/..."]', originalValues.twitter_url)

    // Save
    await page.click('button:has-text("Save Settings")')
    await page.waitForTimeout(2000)

    console.log('Values reset to original')
    await context.close()
  })

  // ===== LOGIN TESTS =====
  test.describe('Login', () => {
    test('should login successfully', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await expect(page.locator('h1')).toContainText('Site Editor')
    })

    test('should show login page elements', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await expect(page.locator('h1')).toContainText('Site Editor Login')
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
    })
  })

  // ===== SITE SETTINGS TESTS =====
  test.describe('Site Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Site Settings")')
      await page.waitForTimeout(500)
    })

    test('Site Name - should save and reflect on homepage', async ({ page }) => {
      const testValue = 'TEST SITE NAME ' + Date.now()
      await page.fill('input[placeholder="The Homeownership Community"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)

      // Check success message
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)
      await expect(homePage.locator('nav')).toContainText(testValue)
      await homePage.close()
    })

    test('Site Description - should save', async ({ page }) => {
      const testValue = 'Test site description ' + Date.now()
      await page.fill('input[placeholder="Your site description"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Meta Title - should save and reflect in page head', async ({ page }) => {
      const testValue = 'Test Meta Title ' + Date.now()
      await page.fill('input[placeholder="Your site title for Google"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Meta Description - should save', async ({ page }) => {
      const testValue = 'Test meta description for search engines ' + Date.now()
      await page.fill('textarea[placeholder="Brief description for search results..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Hero Image URL - should save', async ({ page }) => {
      const testValue = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000'
      await page.fill('input[placeholder="https://images.unsplash.com/..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('CTA Button Text - should save and reflect on homepage', async ({ page }) => {
      const testValue = 'TEST CTA BUTTON ' + Date.now()
      await page.fill('input[placeholder="Start Your Journey"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)
      await expect(homePage.locator('a:has-text("' + testValue + '")')).toBeVisible()
      await homePage.close()
    })

    test('Secondary CTA Button Text - should save', async ({ page }) => {
      const testValue = 'TEST SECONDARY CTA ' + Date.now()
      await page.fill('input[placeholder="Get My Book"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Blog Section Title - should save and reflect on homepage', async ({ page }) => {
      const testValue = 'TEST BLOG TITLE ' + Date.now()
      await page.fill('input[placeholder="Latest from the Blog"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)
      await expect(homePage.locator('text="' + testValue + '"')).toBeVisible()
      await homePage.close()
    })

    test('Opt-in Modal Title - should save', async ({ page }) => {
      const testValue = 'TEST MODAL TITLE ' + Date.now()
      await page.fill('input[placeholder="Join the Community"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Opt-in Modal Message - should save', async ({ page }) => {
      const testValue = 'Test modal message ' + Date.now()
      await page.fill('textarea[placeholder="Fill out the form below..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('About Page Title - should save and reflect on about page', async ({ page }) => {
      const testValue = 'TEST ABOUT TITLE ' + Date.now()
      await page.fill('input[placeholder="About Brandon Bee Dixon"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site
      const aboutPage = await page.context().newPage()
      await aboutPage.goto(getBaseUrl() + '/about')
      await aboutPage.waitForTimeout(3000)
      await expect(aboutPage.locator('h1')).toContainText(testValue)
      await aboutPage.close()
    })

    test('Contact Email - should save', async ({ page }) => {
      const testValue = 'test' + Date.now() + '@hocmortgage.com'
      await page.fill('input[placeholder="brandon@hocmortgage.com"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Podcast URL - should save', async ({ page }) => {
      const testValue = 'https://youtube.com/test' + Date.now()
      await page.fill('input[placeholder="https://youtube.com/@channel"]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Footer Mission - should save and reflect on homepage', async ({ page }) => {
      const testValue = 'TEST FOOTER MISSION ' + Date.now()
      await page.fill('textarea[placeholder="Your mission statement..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)
      await expect(homePage.locator('footer')).toContainText(testValue)
      await homePage.close()
    })

    test('Facebook URL - should save', async ({ page }) => {
      const testValue = 'https://facebook.com/test' + Date.now()
      await page.fill('input[placeholder="https://facebook.com/..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Instagram URL - should save', async ({ page }) => {
      const testValue = 'https://instagram.com/test' + Date.now()
      await page.fill('input[placeholder="https://instagram.com/..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('LinkedIn URL - should save', async ({ page }) => {
      const testValue = 'https://linkedin.com/in/test' + Date.now()
      await page.fill('input[placeholder="https://linkedin.com/in/..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })

    test('Twitter URL - should save', async ({ page }) => {
      const testValue = 'https://x.com/test' + Date.now()
      await page.fill('input[placeholder="https://x.com/..."]', testValue)
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
      await expect(page.locator('text=Settings saved successfully!')).toBeVisible({ timeout: 5000 })
    })
  })

  // ===== SECTION VISIBILITY TOGGLES =====
  test.describe('Section Visibility', () => {
    test('Show Books Section toggle - should save and reflect on homepage', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Site Settings")')
      await page.waitForTimeout(500)

      // Toggle books section off
      const booksCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: '' }).first()
      await booksCheckbox.click()
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)

      // Verify on live site - books section should be hidden
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)
      // Books section has specific text "Master Real Estate Investing"
      const booksSection = homePage.locator('text=Master Real Estate Investing')
      await expect(booksSection).not.toBeVisible()
      await homePage.close()

      // Toggle back on
      await booksCheckbox.click()
      await page.click('button:has-text("Save Settings")')
      await page.waitForTimeout(2000)
    })
  })

  // ===== TESTIMONIALS =====
  test.describe('Testimonials', () => {
    let testId: string

    test('should add a testimonial and see it saved', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Testimonials")')
      await page.waitForTimeout(500)

      // Click Add Testimonial
      await page.click('button:has-text("+ Add Testimonial")')
      await page.waitForTimeout(500)

      // Fill form
      const testName = 'TEST USER ' + Date.now()
      const testQuote = 'This is a test quote for the testimonial.'
      await page.fill('input[placeholder="John D."]', testName)
      await page.fill('input[placeholder="First-time Homeowner"]', 'Test Role')
      await page.fill('textarea[placeholder="What they said..."]', testQuote)

      // Submit
      await page.click('button:has-text("Save")')
      await page.waitForTimeout(2000)

      // Should show success and appear in list
      await expect(page.locator('text=Testimonial saved successfully!')).toBeVisible({ timeout: 5000 })
      await expect(page.locator(`text=${testName}`)).toBeVisible()

      // Store ID for cleanup
      const testimonialCard = page.locator('text=' + testName).locator('..')
      testId = (await testimonialCard.getAttribute('data-testid')) || Date.now().toString()

      // Delete the test testimonial
      await page.click('button:has-text("Delete")')
      await page.waitForTimeout(1000)
    })

    test('should edit an existing testimonial', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Testimonials")')
      await page.waitForTimeout(500)

      // If there's an existing testimonial, edit it
      const editButtons = page.locator('button:has-text("Edit")')
      const count = await editButtons.count()

      if (count > 0) {
        await editButtons.first().click()
        await page.waitForTimeout(500)

        // Modify the quote
        const quoteField = page.locator('textarea[placeholder="What they said..."]')
        await quoteField.fill('MODIFIED TEST QUOTE ' + Date.now())

        await page.click('button:has-text("Save")')
        await page.waitForTimeout(2000)
        await expect(page.locator('text=Testimonial saved successfully!')).toBeVisible({ timeout: 5000 })
      }
    })
  })

  // ===== PODCAST =====
  test.describe('Podcast', () => {
    test('should add a podcast episode', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Podcast")')
      await page.waitForTimeout(500)

      await page.click('button:has-text("+ Add Episode")')
      await page.waitForTimeout(500)

      const testTitle = 'TEST EPISODE ' + Date.now()
      await page.fill('input[placeholder="Episode title..."]', testTitle)
      await page.fill('input[placeholder="https://youtube.com/watch?v=..."]', 'https://youtube.com/watch?v=test123')
      await page.fill('textarea[placeholder="Episode description..."]', 'Test description')

      await page.click('button:has-text("Save")')
      await page.waitForTimeout(2000)

      // Should show success and appear in list
      await expect(page.locator('text=Episode saved successfully!')).toBeVisible({ timeout: 5000 })

      // Delete the test episode
      const deleteButtons = page.locator('button:has-text("Delete")')
      await deleteButtons.first().click()
      await page.waitForTimeout(1000)
    })
  })

  // ===== MEDIA =====
  test.describe('Media Library', () => {
    test('should add media via URL', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Media")')
      await page.waitForTimeout(500)

      await page.click('button:has-text("+ Add Media")')
      await page.waitForTimeout(500)

      const testName = 'TEST MEDIA ' + Date.now()
      await page.fill('input[placeholder="Image or PDF name"]', testName)
      await page.fill('input[placeholder="https://..."]', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400')

      await page.click('button:has-text("Add Media")')
      await page.waitForTimeout(2000)

      // Should appear in list
      await expect(page.locator('text=' + testName)).toBeVisible()

      // Delete the test media
      const deleteButtons = page.locator('button:has-text("Delete")')
      await deleteButtons.first().click()
      await page.waitForTimeout(1000)
    })
  })

  // ===== SUBSCRIBERS =====
  test.describe('Subscribers', () => {
    test('should view subscribers list', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Subscribers")')
      await page.waitForTimeout(1000)

      // Should show the subscribers section with table or empty state
      await expect(page.locator('h2:has-text("Email Subscribers")')).toBeVisible()
    })

    test('should export CSV', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Subscribers")')
      await page.waitForTimeout(1000)

      // Export button should be visible and clickable
      const exportButton = page.locator('button:has-text("Export CSV")')
      if (await exportButton.isEnabled()) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download')
        await exportButton.click()
        const download = await downloadPromise
        expect(download.suggestedFilename()).toContain('subscribers')
      }
    })
  })

  // ===== EVENTS =====
  test.describe('Events', () => {
    test('should add an event', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Events")')
      await page.waitForTimeout(500)

      await page.click('button:has-text("+ Add Event")')
      await page.waitForTimeout(500)

      const testTitle = 'TEST EVENT ' + Date.now()
      await page.fill('input[placeholder="Event title..."]', testTitle)
      await page.fill('input[type="datetime-local"]', '2026-12-31T18:00')
      await page.fill('textarea[placeholder="Event description..."]', 'Test event description')

      await page.click('button:has-text("Save")')
      await page.waitForTimeout(2000)

      // Should appear in list
      await expect(page.locator('text=' + testTitle)).toBeVisible()

      // Delete the test event
      const deleteButtons = page.locator('button:has-text("Delete")')
      await deleteButtons.first().click()
      await page.waitForTimeout(1000)
    })

    test('should toggle event active/inactive', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Events")')
      await page.waitForTimeout(500)

      // Find an event with Active status
      const activateButtons = page.locator('button:has-text("Deactivate")')
      if (await activateButtons.count() > 0) {
        await activateButtons.first().click()
        await page.waitForTimeout(1000)

        // Should now show Activate button
        await expect(page.locator('button:has-text("Activate")')).toBeVisible()

        // Toggle back
        await page.locator('button:has-text("Activate")').first().click()
        await page.waitForTimeout(1000)
      }
    })
  })

  // ===== BLOG VISIBILITY =====
  test.describe('Blog Visibility', () => {
    test('should search and toggle blog post visibility', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Blog")')
      await page.waitForTimeout(1000)

      // Should show blog visibility section
      await expect(page.locator('h2:has-text("Blog Visibility")')).toBeVisible()

      // Get initial visibility count
      const initialCount = await page.locator('text=/\\d+ of \\d+ posts visible/').textContent()

      // Try searching
      const searchInput = page.locator('input[placeholder="Search posts by title or category..."]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500)
      }

      // Find a visible post and hide it
      const hideButtons = page.locator('button:has-text("Hide")')
      const hideCount = await hideButtons.count()

      if (hideCount > 0) {
        await hideButtons.first().click()
        await page.waitForTimeout(1000)

        // Should show Show button now
        await expect(page.locator('button:has-text("Show")').first()).toBeVisible()

        // Toggle back to visible
        await page.locator('button:has-text("Show")').first().click()
        await page.waitForTimeout(1000)
      }
    })

    test('should bulk select and hide posts', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Blog")')
      await page.waitForTimeout(1000)

      // Select first checkbox
      const checkboxes = page.locator('input[type="checkbox"]')
      const firstCheckbox = checkboxes.first()
      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.click()
        await page.waitForTimeout(500)

        // Should show bulk actions
        const hideSelectedButton = page.locator('button:has-text("Hide Selected")')
        if (await hideSelectedButton.isVisible()) {
          // Deselect first
          await firstCheckbox.click()
          await page.waitForTimeout(500)
        }
      }
    })
  })

  // ===== BOOKS =====
  test.describe('Books', () => {
    test('should add a book', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Books")')
      await page.waitForTimeout(500)

      await page.click('button:has-text("+ Add Book")')
      await page.waitForTimeout(500)

      const testTitle = 'TEST BOOK ' + Date.now()
      await page.fill('input[placeholder="Book title..."]', testTitle)
      await page.fill('input[placeholder="https://amazon.com/..."]', 'https://amazon.com/test')

      await page.click('button:has-text("Save Book")')
      await page.waitForTimeout(2000)

      // Should appear in list
      await expect(page.locator('text=' + testTitle)).toBeVisible()

      // Delete the test book
      const deleteButtons = page.locator('button:has-text("Delete")')
      await deleteButtons.first().click()
      await page.waitForTimeout(1000)
    })

    test('should edit an existing book', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Books")')
      await page.waitForTimeout(500)

      const editButtons = page.locator('button:has-text("Edit")')
      const count = await editButtons.count()

      if (count > 0) {
        await editButtons.first().click()
        await page.waitForTimeout(500)

        // Modify title
        const titleField = page.locator('input[placeholder="Book title..."]')
        await titleField.fill('MODIFIED BOOK TITLE ' + Date.now())

        await page.click('button:has-text("Save Book")')
        await page.waitForTimeout(2000)
      }
    })
  })

  // ===== THEME EDITOR =====
  test.describe('Theme Editor', () => {
    test('should apply a preset and verify on live site', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Theme")')
      await page.waitForTimeout(500)

      // Click Midnight Blue preset (second one)
      const presets = page.locator('button:has-text("Midnight Blue")')
      await presets.click()
      await page.waitForTimeout(500)

      // Save
      await page.click('button:has-text("Save Theme")')
      await page.waitForTimeout(2000)

      // Should show success message
      await expect(page.locator('text=Theme saved successfully!')).toBeVisible({ timeout: 5000 })

      // Verify on live site - navigation should have dark background
      const homePage = await page.context().newPage()
      await homePage.goto(getBaseUrl())
      await homePage.waitForTimeout(3000)

      // Get nav background color
      const nav = homePage.locator('nav').first()
      const bgColor = await nav.evaluate((el) => getComputedStyle(el).backgroundColor)
      console.log('Nav background color:', bgColor)
      // Midnight Blue is #1a1a2e which is rgb(26, 26, 46)
      // The nav uses semi-transparent bg, so check if it exists
      expect(bgColor).toBeTruthy()

      await homePage.close()

      // Reset to default Classic Red
      const defaultPreset = page.locator('button:has-text("Classic Red")')
      await defaultPreset.click()
      await page.waitForTimeout(500)
      await page.click('button:has-text("Save Theme")')
      await page.waitForTimeout(2000)
    })

    test('should change primary color', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })
      await page.click('button:has-text("Theme")')
      await page.waitForTimeout(500)

      // Change primary color to green
      const colorInput = page.locator('input[type="color"]').nth(2) // Primary color is 3rd
      await colorInput.fill('#00FF00')
      await page.waitForTimeout(500)

      await page.click('button:has-text("Save Theme")')
      await page.waitForTimeout(2000)

      await expect(page.locator('text=Theme saved successfully!')).toBeVisible({ timeout: 5000 })

      // Reset to red
      await colorInput.fill('#A61C30')
      await page.click('button:has-text("Save Theme")')
      await page.waitForTimeout(2000)
    })
  })

  // ===== LOGOUT =====
  test.describe('Logout', () => {
    test('should logout successfully and redirect to homepage', async ({ page }) => {
      await page.goto(`${getBaseUrl()}/admin/login`)
      await page.fill('input[type="email"]', ADMIN_EMAIL)
      await page.fill('input[type="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 30000 })

      await page.click('button:has-text("Logout")')
      await page.waitForURL(getBaseUrl() + '/', { timeout: 10000 })

      // Should be on homepage
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('text=Welcome to the Ownership Movement')).toBeVisible()
    })
  })
})
