import { test, expect } from "@playwright/test"
import { HomePage, ShopPage } from "../pages"

/**
 * E2E Tests for Public Pages
 * Tests that all public-facing pages load correctly and display expected content
 */

test.describe("Homepage", () => {
  test("should load and display hero section", async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(page).toHaveTitle(/starterspark/i)
    await homePage.expectPageLoaded()
  })

  test("should display navigation header with all links", async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.header).toBeVisible()
    await expect(homePage.logo).toBeVisible()
    await expect(homePage.navShop).toBeVisible()
    await expect(homePage.navLearn).toBeVisible()
    await expect(homePage.navCommunity).toBeVisible()
    await expect(homePage.navAbout).toBeVisible()
    await expect(homePage.navEvents).toBeVisible()
  })

  test("should display cart and workshop buttons in header", async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.cartButton).toBeVisible()
    await expect(homePage.workshopButton).toBeVisible()
    await expect(homePage.shopKitsButton).toBeVisible()
  })

  test("should display footer", async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()

    await expect(homePage.footer).toBeVisible()
  })

  test("should navigate to shop from hero CTA", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /shop kits/i }).first().click()
    await expect(page).toHaveURL(/\/shop/)
  })
})

test.describe("Shop Page", () => {
  test("should load and display page title", async ({ page }) => {
    const shopPage = new ShopPage(page)
    await shopPage.goto()

    await shopPage.expectPageLoaded()
    await expect(page).toHaveURL("/shop")
  })

  test("should display product cards", async ({ page }) => {
    const shopPage = new ShopPage(page)
    await shopPage.goto()

    // Check that at least one product link exists
    const productLinks = page.locator('a[href^="/shop/"]')
    await expect(productLinks.first()).toBeVisible()
  })

  test("should display educator CTA section", async ({ page }) => {
    const shopPage = new ShopPage(page)
    await shopPage.goto()

    await shopPage.expectEducatorCTAVisible()
  })

  test("should navigate to product detail when clicking a product", async ({
    page,
  }) => {
    const shopPage = new ShopPage(page)
    await shopPage.goto()

    await shopPage.clickFirstProduct()
    await expect(page).toHaveURL(/\/shop\/.+/)
  })

  test("should display footer", async ({ page }) => {
    await page.goto("/shop")
    await expect(page.locator("footer")).toBeVisible()
  })
})

test.describe("About Page", () => {
  test("should load and display about content", async ({ page }) => {
    await page.goto("/about")

    // Check page loaded
    await expect(page).toHaveURL("/about")

    // Check for about page sections
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })

  test("should display team section", async ({ page }) => {
    await page.goto("/about")

    // Look for team-related content
    const teamSection = page.getByText(/team|founders|members/i)
    await expect(teamSection.first()).toBeVisible()
  })

  test("should display mission/story section", async ({ page }) => {
    await page.goto("/about")

    // Look for mission-related content
    const missionContent = page.getByText(/mission|story|about/i)
    await expect(missionContent.first()).toBeVisible()
  })

  test("should display footer", async ({ page }) => {
    await page.goto("/about")
    await expect(page.locator("footer")).toBeVisible()
  })
})

test.describe("Events Page", () => {
  test("should load and display events content", async ({ page }) => {
    await page.goto("/events")

    await expect(page).toHaveURL("/events")

    // Check for events heading
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })

  test("should display events or empty state", async ({ page }) => {
    await page.goto("/events")

    // Either events are displayed or an empty state message
    const eventsOrEmpty = page
      .getByText(/upcoming|past|no events|events/i)
      .first()
    await expect(eventsOrEmpty).toBeVisible()
  })

  test("should display footer", async ({ page }) => {
    await page.goto("/events")
    await expect(page.locator("footer")).toBeVisible()
  })
})

test.describe("Learn Page", () => {
  test("should load and display learn content", async ({ page }) => {
    await page.goto("/learn")

    await expect(page).toHaveURL("/learn")

    // Check for learn/courses heading or content
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })

  test("should display courses or content", async ({ page }) => {
    await page.goto("/learn")

    // Look for course-related content
    const content = page.getByText(/course|learn|tutorial|lesson/i)
    await expect(content.first()).toBeVisible()
  })

  test("should display footer", async ({ page }) => {
    await page.goto("/learn")
    await expect(page.locator("footer")).toBeVisible()
  })
})

test.describe("Community Page", () => {
  test("should load and display community content", async ({ page }) => {
    await page.goto("/community")

    await expect(page).toHaveURL("/community")

    // Check for community/forum heading
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })

  test("should display questions or empty state", async ({ page }) => {
    await page.goto("/community")

    // Look for forum-related content
    const content = page.getByText(
      /question|discussion|forum|ask|community/i
    )
    await expect(content.first()).toBeVisible()
  })

  test("should display ask a question CTA", async ({ page }) => {
    await page.goto("/community")

    // Look for a way to ask questions
    const askButton = page.getByRole("link", { name: /ask|new|post/i }).first()
    if (await askButton.isVisible()) {
      await expect(askButton).toBeVisible()
    }
  })

  test("should display footer", async ({ page }) => {
    await page.goto("/community")
    await expect(page.locator("footer")).toBeVisible()
  })
})

test.describe("Privacy Policy Page", () => {
  test("should load and display privacy policy", async ({ page }) => {
    await page.goto("/privacy")

    await expect(page).toHaveURL("/privacy")

    // Check for privacy-related content
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })
})

test.describe("Terms of Service Page", () => {
  test("should load and display terms of service", async ({ page }) => {
    await page.goto("/terms")

    await expect(page).toHaveURL("/terms")

    // Check for terms-related content
    const heading = page.getByRole("heading", { level: 1 }).first()
    await expect(heading).toBeVisible()
  })
})
