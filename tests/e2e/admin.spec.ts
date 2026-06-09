import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test('should show login page and login form elements', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('h1')).toContainText('Site Editor Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 })
  })
})
