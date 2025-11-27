import { Page, Locator, expect } from "@playwright/test"

/**
 * Page Object Model for the Homepage
 */
export class HomePage {
  readonly page: Page

  // Header elements
  readonly header: Locator
  readonly logo: Locator
  readonly navShop: Locator
  readonly navLearn: Locator
  readonly navCommunity: Locator
  readonly navAbout: Locator
  readonly navEvents: Locator
  readonly cartButton: Locator
  readonly workshopButton: Locator
  readonly shopKitsButton: Locator
  readonly mobileMenuButton: Locator

  // Hero section
  readonly heroSection: Locator
  readonly heroTitle: Locator
  readonly heroCTA: Locator

  // Content sections
  readonly differentiatorSection: Locator
  readonly productSpotlight: Locator
  readonly learningPreview: Locator
  readonly missionSection: Locator
  readonly eventsPreview: Locator
  readonly footer: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.header = page.locator("header")
    this.logo = page.getByRole("link", { name: /starterspark/i })
    this.navShop = page.getByRole("link", { name: "Shop" }).first()
    this.navLearn = page.getByRole("link", { name: "Learn" }).first()
    this.navCommunity = page.getByRole("link", { name: "Community" }).first()
    this.navAbout = page.getByRole("link", { name: "About" }).first()
    this.navEvents = page.getByRole("link", { name: "Events" }).first()
    this.cartButton = page.getByLabel("Cart")
    this.workshopButton = page.getByRole("link", { name: "Workshop" }).first()
    this.shopKitsButton = page.getByRole("link", { name: "Shop Kits" }).first()
    this.mobileMenuButton = page.getByLabel("Toggle menu")

    // Hero
    this.heroSection = page.locator("section").first()
    this.heroTitle = page.getByRole("heading", { level: 1 }).first()
    this.heroCTA = page.getByRole("link", { name: /shop|get started/i }).first()

    // Sections
    this.differentiatorSection = page.locator("section").nth(1)
    this.productSpotlight = page.getByText(/spotlight/i).first()
    this.learningPreview = page.getByText(/learning|learn/i).first()
    this.missionSection = page.getByText(/mission|70%|charity/i).first()
    this.eventsPreview = page.getByText(/events|upcoming/i).first()
    this.footer = page.locator("footer")
  }

  async goto() {
    await this.page.goto("/")
  }

  async expectPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.heroTitle).toBeVisible()
  }

  async navigateToShop() {
    await this.navShop.click()
    await this.page.waitForURL("**/shop")
  }

  async navigateToLearn() {
    await this.navLearn.click()
    await this.page.waitForURL("**/learn")
  }

  async navigateToAbout() {
    await this.navAbout.click()
    await this.page.waitForURL("**/about")
  }

  async navigateToEvents() {
    await this.navEvents.click()
    await this.page.waitForURL("**/events")
  }

  async navigateToCommunity() {
    await this.navCommunity.click()
    await this.page.waitForURL("**/community")
  }

  async navigateToWorkshop() {
    await this.workshopButton.click()
    await this.page.waitForURL("**/workshop")
  }

  async openCart() {
    await this.cartButton.click()
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click()
  }

  async getCartCount(): Promise<number> {
    const badge = this.page.locator('[aria-label="Cart"] span')
    if (await badge.isVisible()) {
      const text = await badge.textContent()
      return text === "9+" ? 10 : parseInt(text || "0", 10)
    }
    return 0
  }
}
