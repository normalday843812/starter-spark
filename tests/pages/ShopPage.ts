import { Page, Locator, expect } from "@playwright/test"

/**
 * Page Object Model for the Shop Page
 */
export class ShopPage {
  readonly page: Page

  // Page elements
  readonly pageTitle: Locator
  readonly productGrid: Locator
  readonly productCards: Locator
  readonly educatorCTA: Locator
  readonly footer: Locator

  constructor(page: Page) {
    this.page = page

    this.pageTitle = page.getByRole("heading", { name: /robotics kits/i })
    this.productGrid = page.locator('[class*="grid"]').first()
    this.productCards = page.locator('[class*="border"][class*="rounded"]').filter({
      has: page.locator('[class*="font-mono"]'),
    })
    this.educatorCTA = page.getByText(/educator or school/i)
    this.footer = page.locator("footer")
  }

  async goto() {
    await this.page.goto("/shop")
  }

  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible()
  }

  async getProductCount(): Promise<number> {
    // Find elements that look like product cards (have price and name)
    const cards = this.page.locator('a[href^="/shop/"]')
    return await cards.count()
  }

  async clickProduct(slug: string) {
    await this.page.getByRole("link", { name: new RegExp(slug, "i") }).first().click()
    await this.page.waitForURL(`**/shop/${slug}`)
  }

  async clickFirstProduct() {
    const firstProduct = this.page.locator('a[href^="/shop/"]').first()
    await firstProduct.click()
    await this.page.waitForURL("**/shop/*")
  }

  async expectProductsDisplayed() {
    const count = await this.getProductCount()
    expect(count).toBeGreaterThan(0)
  }

  async expectEducatorCTAVisible() {
    await expect(this.educatorCTA).toBeVisible()
  }
}
