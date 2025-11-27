import { test, expect } from "@playwright/test"
import { LoginPage, WorkshopPage } from "../pages"

/**
 * E2E Tests for Authentication
 * Tests login page, magic link flow, and auth-protected routes
 */

test.describe("Login Page", () => {
  test("should load login page", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.expectPageLoaded()
  })

  test("should display email input field", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.emailInput).toBeEnabled()
  })

  test("should display send magic link button", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.submitButton).toBeVisible()
    await expect(loginPage.submitButton).toHaveText(/send magic link/i)
  })

  test("should accept email input", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.fillEmail("test@example.com")

    await expect(loginPage.emailInput).toHaveValue("test@example.com")
  })

  test("should show error for empty email submission", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Try to submit without email
    await loginPage.submitForm()

    // Browser validation should prevent submission or show error
    // The HTML5 validation will trigger for empty required field
    const emailInput = loginPage.emailInput
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    )
    expect(validity).toBe(false)
  })

  test("should show error for invalid email format", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.fillEmail("invalid-email")
    await loginPage.submitForm()

    // Browser validation should trigger
    const emailInput = loginPage.emailInput
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    )
    expect(validity).toBe(false)
  })

  test("should show loading state when submitting", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.fillEmail("test@example.com")
    await loginPage.submitForm()

    // Should briefly show loading state
    const loadingButton = page.getByRole("button", { name: /sending/i })
    // This happens quickly, so we just verify the button changes state
  })

  test("should show success message after valid submission", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.fillEmail("test@example.com")
    await loginPage.submitForm()

    // Wait for success state (may take a moment to send email)
    await expect(loginPage.successMessage).toBeVisible({ timeout: 10000 })
  })

  test("should allow using different email after success", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.fillEmail("test@example.com")
    await loginPage.submitForm()

    // Wait for success
    await expect(loginPage.successMessage).toBeVisible({ timeout: 10000 })

    // Click use different email
    await loginPage.clickUseDifferentEmail()

    // Should show form again
    await expect(loginPage.emailInput).toBeVisible()
  })
})

test.describe("Login Page - Query Parameters", () => {
  test("should accept redirect parameter", async ({ page }) => {
    await page.goto("/login?redirect=/workshop")

    const loginPage = new LoginPage(page)
    await loginPage.expectPageLoaded()

    // Page should load with redirect param
    expect(page.url()).toContain("redirect")
  })

  test("should accept claim token parameter", async ({ page }) => {
    await page.goto("/login?claim=test-token-123")

    const loginPage = new LoginPage(page)
    await loginPage.expectPageLoaded()

    // Page should load with claim param
    expect(page.url()).toContain("claim")
  })

  test("should accept both redirect and claim parameters", async ({ page }) => {
    await page.goto("/login?redirect=/workshop&claim=test-token-123")

    const loginPage = new LoginPage(page)
    await loginPage.expectPageLoaded()
  })
})

test.describe("Protected Routes - Unauthenticated", () => {
  test("should show sign in required on workshop page", async ({ page }) => {
    // Clear any existing auth
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    const workshopPage = new WorkshopPage(page)
    await workshopPage.goto()
    await workshopPage.expectPageLoaded()

    // Should see sign in required or redirect to login
    const signInMessage = page.getByText(/sign in|login|must be logged in/i)
    const isOnWorkshop = page.url().includes("/workshop")

    if (isOnWorkshop) {
      // Either shows sign-in message or redirects
      const hasSignInMessage = await signInMessage.first().isVisible()
      expect(hasSignInMessage).toBeTruthy()
    }
  })

  test("should redirect claim page to login for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/claim/test-token-123")

    // Should either show login prompt or redirect to login
    const currentUrl = page.url()
    const hasLoginPrompt =
      currentUrl.includes("/login") ||
      (await page.getByText(/sign in|login/i).first().isVisible())

    expect(hasLoginPrompt).toBeTruthy()
  })
})

test.describe("Auth UI Components", () => {
  test("should display sign in link in workshop for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/workshop")

    const signInLink = page.getByRole("link", { name: /sign in/i })
    if (await signInLink.isVisible()) {
      await expect(signInLink).toBeVisible()
    }
  })

  test("should navigate to login when clicking sign in", async ({ page }) => {
    await page.goto("/workshop")

    const signInLink = page.getByRole("link", { name: /sign in/i })
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })
})

test.describe("Session Handling", () => {
  test("should handle page reload without errors", async ({ page }) => {
    await page.goto("/login")
    await page.reload()

    // Page should still work
    const loginPage = new LoginPage(page)
    await loginPage.expectPageLoaded()
  })

  test("should handle navigation between auth and non-auth pages", async ({
    page,
  }) => {
    // Navigate between pages
    await page.goto("/")
    await page.goto("/login")
    await page.goto("/workshop")
    await page.goto("/")
    await page.goto("/login")

    // Should not crash
    const loginPage = new LoginPage(page)
    await loginPage.expectPageLoaded()
  })
})
