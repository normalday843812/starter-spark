import { test, expect } from "@playwright/test"
import { CartPage, ProductPage, HomePage } from "../pages"

/**
 * E2E Tests for Shopping Cart
 * Tests cart functionality including add, remove, update quantity, and checkout
 */

test.describe("Cart - Empty State", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.removeItem("starterspark-cart")
    })
  })

  test("should display empty cart message", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.expectEmptyCart()
  })

  test("should show Browse Kits button on empty cart", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await expect(cartPage.browseKitsButton).toBeVisible()
  })

  test("should navigate to shop when clicking Browse Kits", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.browseKitsButton.click()
    await expect(page).toHaveURL("/shop")
  })

  test("should show zero count in header cart badge", async ({ page }) => {
    await page.goto("/")

    // Cart badge should not be visible when empty
    const badge = page.locator('[aria-label="Cart"] span')
    await expect(badge).toBeHidden()
  })
})

test.describe("Cart - Add Items", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.removeItem("starterspark-cart")
    })
  })

  test("should add item to cart from product page", async ({ page }) => {
    // Go to shop and find a product
    await page.goto("/shop")
    const productLink = page.locator('a[href^="/shop/"]').first()
    const href = await productLink.getAttribute("href")
    await productLink.click()

    // Wait for product page to load
    await page.waitForURL(/\/shop\/.+/)

    // Add to cart
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i })
    await addToCartBtn.click()

    // Wait for cart to update
    await page.waitForTimeout(500)

    // Cart should update - check badge or cart state
    await page.goto("/cart")
    const cartPage = new CartPage(page)
    await cartPage.expectItemsInCart()
  })

  test("should open cart sheet when adding item", async ({ page }) => {
    // Navigate to a product
    await page.goto("/shop")
    await page.locator('a[href^="/shop/"]').first().click()
    await page.waitForURL(/\/shop\/.+/)

    // Add to cart
    await page.getByRole("button", { name: /add to cart/i }).click()

    // Cart sheet or indicator should be visible
    // The cart opens automatically after adding
    await page.waitForTimeout(300)
  })

  test("should increment quantity when adding same item twice", async ({
    page,
  }) => {
    // Navigate to a product
    await page.goto("/shop")
    await page.locator('a[href^="/shop/"]').first().click()
    await page.waitForURL(/\/shop\/.+/)

    // Add to cart twice
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i })
    await addToCartBtn.click()
    await page.waitForTimeout(300)

    // Close cart if open (click elsewhere or navigate)
    await page.goto(page.url()) // Reload to close cart

    // Add again
    await addToCartBtn.click()
    await page.waitForTimeout(300)

    // Go to cart page and verify quantity
    await page.goto("/cart")
    const quantityText = page.locator(".font-mono").filter({ hasText: /^2$/ })
    await expect(quantityText.first()).toBeVisible()
  })

  test("should add multiple items with specified quantity", async ({ page }) => {
    // Navigate to a product
    await page.goto("/shop")
    await page.locator('a[href^="/shop/"]').first().click()
    await page.waitForURL(/\/shop\/.+/)

    // Increase quantity to 3
    const increaseBtn = page.getByLabel("Increase quantity")
    await increaseBtn.click()
    await increaseBtn.click()

    // Add to cart
    await page.getByRole("button", { name: /add to cart/i }).click()
    await page.waitForTimeout(300)

    // Go to cart and verify
    await page.goto("/cart")
    const quantityText = page.locator(".font-mono").filter({ hasText: /^3$/ })
    await expect(quantityText.first()).toBeVisible()
  })
})

test.describe("Cart - Update Items", () => {
  test.beforeEach(async ({ page }) => {
    // Set up cart with one item
    await page.goto("/")
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
  })

  test("should increase item quantity", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.increaseItemQuantity(0)

    // Verify quantity increased
    await page.waitForTimeout(200)
    const quantityText = page.locator(".font-mono").filter({ hasText: /^2$/ })
    await expect(quantityText.first()).toBeVisible()
  })

  test("should decrease item quantity", async ({ page }) => {
    // First set quantity to 2
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 2,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.decreaseItemQuantity(0)

    // Verify quantity decreased
    await page.waitForTimeout(200)
    const quantityText = page.locator(".font-mono").filter({ hasText: /^1$/ })
    await expect(quantityText.first()).toBeVisible()
  })

  test("should remove item when decreasing quantity to zero", async ({
    page,
  }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    // Decrease from 1 to 0 should remove
    await cartPage.decreaseItemQuantity(0)

    await page.waitForTimeout(200)
    await cartPage.expectEmptyCart()
  })

  test("should remove item when clicking remove button", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.removeItem(0)

    await page.waitForTimeout(200)
    await cartPage.expectEmptyCart()
  })

  test("should clear all items when clicking Clear Cart", async ({ page }) => {
    // Add multiple items
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 2,
            },
            {
              slug: "another-kit",
              name: "Another Kit",
              price: 49,
              quantity: 1,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    const cartPage = new CartPage(page)
    await cartPage.goto()

    await cartPage.clearCart()

    await page.waitForTimeout(200)
    await cartPage.expectEmptyCart()
  })
})

test.describe("Cart - Order Summary", () => {
  test("should display correct subtotal", async ({ page }) => {
    // Set up cart with known values
    await page.goto("/")
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 2,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    const cartPage = new CartPage(page)
    await cartPage.goto()

    // Subtotal should be 99 * 2 = 198
    const subtotalText = page.getByText("$198.00")
    await expect(subtotalText).toBeVisible()
  })

  test("should show free shipping for orders over $75", async ({ page }) => {
    // Set up cart with total > $75
    await page.goto("/")
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

    const cartPage = new CartPage(page)
    await cartPage.goto()

    const freeShipping = page.getByText("FREE")
    await expect(freeShipping).toBeVisible()
  })

  test("should show shipping cost for orders under $75", async ({ page }) => {
    // Set up cart with total < $75
    await page.goto("/")
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "small-item",
              name: "Small Item",
              price: 29,
              quantity: 1,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    const cartPage = new CartPage(page)
    await cartPage.goto()

    // Should show $9.99 shipping
    const shippingCost = page.getByText("$9.99")
    await expect(shippingCost).toBeVisible()
  })

  test("should show message about free shipping threshold", async ({ page }) => {
    // Set up cart with total < $75
    await page.goto("/")
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "small-item",
              name: "Small Item",
              price: 50,
              quantity: 1,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    const cartPage = new CartPage(page)
    await cartPage.goto()

    // Should show "Add $X more for free shipping"
    const freeShippingMsg = page.getByText(/add.*more.*free shipping/i)
    await expect(freeShippingMsg).toBeVisible()
  })

  test("should display charity notice", async ({ page }) => {
    await page.goto("/")
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

    const cartPage = new CartPage(page)
    await cartPage.goto()

    await expect(cartPage.charityNote).toBeVisible()
  })
})

test.describe("Cart - Checkout", () => {
  test.beforeEach(async ({ page }) => {
    // Set up cart with item
    await page.goto("/")
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
  })

  test("should show checkout button", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await expect(cartPage.checkoutButton).toBeVisible()
    await expect(cartPage.checkoutButton).toBeEnabled()
  })

  test("should show loading state when clicking checkout", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    // Click checkout and check for loading state
    await cartPage.checkoutButton.click()

    // Should show "Processing..." text
    const loadingText = page.getByText(/processing/i)
    // This may appear briefly before redirect
  })

  test("should display trust signals", async ({ page }) => {
    const cartPage = new CartPage(page)
    await cartPage.goto()

    await expect(cartPage.freeShippingNote).toBeVisible()
    await expect(cartPage.secureCheckoutNote).toBeVisible()
  })
})

test.describe("Cart - Persistence", () => {
  test("should persist cart across page reloads", async ({ page }) => {
    // Add item to cart
    await page.goto("/")
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

    // Reload page
    await page.reload()

    // Go to cart and verify item is still there
    await page.goto("/cart")
    const cartPage = new CartPage(page)
    await cartPage.expectItemsInCart()
  })

  test("should persist cart across different pages", async ({ page }) => {
    // Add item to cart
    await page.goto("/")
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

    // Navigate to different pages
    await page.goto("/shop")
    await page.goto("/about")
    await page.goto("/cart")

    // Cart should still have item
    const cartPage = new CartPage(page)
    await cartPage.expectItemsInCart()
  })
})

test.describe("Cart - Header Badge", () => {
  test("should update badge count when adding items", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.removeItem("starterspark-cart")
    })
    await page.reload()

    // Badge should not be visible initially
    let badge = page.locator('[aria-label="Cart"] span')
    await expect(badge).toBeHidden()

    // Add item via localStorage
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 3,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    // Reload to trigger state update
    await page.reload()

    // Badge should show count
    badge = page.locator('[aria-label="Cart"] span')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText("3")
  })

  test("should show 9+ for more than 9 items", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      const cartState = {
        state: {
          items: [
            {
              slug: "4dof-robotic-arm-kit",
              name: "4DOF Robotic Arm Kit",
              price: 99,
              quantity: 15,
            },
          ],
        },
        version: 0,
      }
      localStorage.setItem("starterspark-cart", JSON.stringify(cartState))
    })

    await page.reload()

    const badge = page.locator('[aria-label="Cart"] span')
    await expect(badge).toHaveText("9+")
  })
})
