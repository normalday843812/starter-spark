import { test as base, expect, Page } from "@playwright/test"

/**
 * Custom test fixtures for StarterSpark E2E tests
 * Provides reusable setup for authentication, cart state, and database helpers
 */

// Extend the base test with custom fixtures
export const test = base.extend<{
  // Cart state management
  emptyCart: Page
  cartWithItem: Page
}>({
  // Fixture that ensures the cart is empty before the test
  emptyCart: async ({ page }, use) => {
    // Clear localStorage cart state
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.removeItem("starterspark-cart")
    })
    await page.reload()
    await use(page)
  },

  // Fixture that pre-populates the cart with a test item
  cartWithItem: async ({ page }, use) => {
    await page.goto("/")
    // Set cart state in localStorage
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 1,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })
    await page.reload()
    await use(page)
  },
})

// Re-export expect for convenience
export { expect }

/**
 * Helper function to wait for page hydration
 * Useful for Next.js pages that need JavaScript to be fully loaded
 */
export async function waitForHydration(page: Page) {
  // Wait for React to hydrate by checking for interactive elements
  await page.waitForFunction(() => {
    return document.readyState === "complete"
  })
  // Additional small delay for client-side state initialization
  await page.waitForTimeout(100)
}

/**
 * Helper to add an item to cart via the UI
 */
export async function addItemToCart(
  page: Page,
  productSlug: string,
  quantity: number = 1
) {
  await page.goto(`/shop/${productSlug}`)

  // Set quantity if more than 1
  if (quantity > 1) {
    for (let i = 1; i < quantity; i++) {
      await page.getByLabel("Increase quantity").click()
    }
  }

  await page.getByRole("button", { name: /add to cart/i }).click()

  // Wait for cart to update
  await page.waitForTimeout(300)
}

/**
 * Helper to clear the cart
 */
export async function clearCart(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("starterspark-cart")
  })
}

/**
 * Helper to check if an element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector)
  return await element.isVisible()
}

/**
 * Test data for products (should match database seed)
 */
export const testProducts = {
  roboticArm: {
    slug: "4dof-robotic-arm-kit",
    name: "4DOF Robotic Arm Kit",
    price: 99,
  },
}

/**
 * Test data for license codes (for claim flow tests)
 * Note: These are example formats - actual tests will need real codes or mocks
 */
export const testLicenseCodes = {
  validFormat: "ABCD-EFGH-IJKL-MNOP",
  invalidFormat: "invalid",
  tooShort: "AB",
  tooLong: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
}
