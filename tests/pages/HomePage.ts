import { Page, Locator, expect } from "@playwright/test"

/**
 * Page Object Model for the Homepage
 * Handles both desktop and mobile viewports automatically
 */
export class HomePage {
  readonly page: Page

  // Header elements
  readonly header: Locator
  readonly logo: Locator
  readonly mobileMenuButton: Locator
  readonly footer: Locator

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

  constructor(page: Page) {
    this.page = page

    // Header
    this.header = page.locator("header")
    this.logo = page.getByRole("link", { name: /starterspark/i })
    this.mobileMenuButton = page.getByLabel("Toggle menu")
    this.footer = page.locator("footer")

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
  }

  /**
   * Check if we're in mobile viewport (width < 768px)
   */
  async isMobileViewport(): Promise<boolean> {
    const viewportSize = this.page.viewportSize()
    return viewportSize ? viewportSize.width < 768 : false
  }

  /**
   * Open mobile menu if in mobile viewport
   */
  async ensureMobileMenuOpen(): Promise<void> {
    if (await this.isMobileViewport()) {
      const isMobileMenuVisible = await this.mobileMenuButton.isVisible()
      if (isMobileMenuVisible) {
        // Check if menu is already open by looking for the mobile nav
        const mobileNav = this.page.locator(".md\\:hidden nav, nav.md\\:hidden")
        if (!(await mobileNav.isVisible())) {
          await this.mobileMenuButton.click()
          // Wait for menu to be visible instead of arbitrary timeout
          await mobileNav.waitFor({ state: "visible", timeout: 3000 })
        }
      }
    }
  }

  /**
   * Close any open dialogs/sheets that might block interactions
   */
  async closeAnyOpenDialogs(): Promise<void> {
    const dialog = this.page.getByRole("dialog")
    if (await dialog.isVisible()) {
      await this.page.keyboard.press("Escape")
      await dialog.waitFor({ state: "hidden", timeout: 3000 })
    }
  }

  /**
   * Get the navigation link based on viewport
   */
  private getNavLink(name: string): Locator {
    return this.page.getByRole("link", { name, exact: true }).first()
  }

  // Desktop-only locators (for visibility assertions)
  get navShop(): Locator {
    return this.page.locator("nav.hidden.md\\:flex").getByRole("link", { name: "Shop" })
  }

  get navLearn(): Locator {
    return this.page.locator("nav.hidden.md\\:flex").getByRole("link", { name: "Learn" })
  }

  get navCommunity(): Locator {
    return this.page.locator("nav.hidden.md\\:flex").getByRole("link", { name: "Community" })
  }

  get navAbout(): Locator {
    return this.page.locator("nav.hidden.md\\:flex").getByRole("link", { name: "About" })
  }

  get navEvents(): Locator {
    return this.page.locator("nav.hidden.md\\:flex").getByRole("link", { name: "Events" })
  }

  get cartButton(): Locator {
    return this.page.getByLabel("Cart").first()
  }

  get workshopButton(): Locator {
    return this.page.getByRole("link", { name: "Workshop" }).first()
  }

  get shopKitsButton(): Locator {
    return this.page.getByRole("link", { name: "Shop Kits" }).first()
  }

  async goto() {
    await this.page.goto("/")
  }

  async expectPageLoaded() {
    await expect(this.header).toBeVisible()
    await expect(this.heroTitle).toBeVisible()
  }

  async navigateToShop() {
    await this.ensureMobileMenuOpen()
    await this.getNavLink("Shop").click()
    await this.page.waitForURL("**/shop")
  }

  async navigateToLearn() {
    await this.ensureMobileMenuOpen()
    await this.getNavLink("Learn").click()
    await this.page.waitForURL("**/learn")
  }

  async navigateToAbout() {
    await this.ensureMobileMenuOpen()
    await this.getNavLink("About").click()
    await this.page.waitForURL("**/about")
  }

  async navigateToEvents() {
    await this.ensureMobileMenuOpen()
    await this.getNavLink("Events").click()
    await this.page.waitForURL("**/events")
  }

  async navigateToCommunity() {
    await this.ensureMobileMenuOpen()
    await this.getNavLink("Community").click()
    await this.page.waitForURL("**/community")
  }

  async navigateToWorkshop() {
    // Close any open dialogs that might block the click
    await this.closeAnyOpenDialogs()

    if (await this.isMobileViewport()) {
      await this.ensureMobileMenuOpen()
      // On mobile, Workshop is inside the mobile menu
      await this.page.locator(".md\\:hidden").getByRole("link", { name: "Workshop" }).click()
    } else {
      // On desktop, Workshop is in the header actions section
      await this.page.locator("header").getByRole("link", { name: "Workshop" }).click()
    }
    await this.page.waitForURL("**/workshop")
  }

  async openCart() {
    if (await this.isMobileViewport()) {
      await this.ensureMobileMenuOpen()
      // On mobile, cart is a button in the mobile menu
      await this.page.getByRole("button", { name: /cart/i }).click()
    } else {
      await this.cartButton.click()
    }
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click()
  }

  async getCartCount(): Promise<number> {
    const badge = this.page.locator('[aria-label^="Shopping cart"] span')
    if (await badge.isVisible()) {
      const text = await badge.textContent()
      return text === "9+" ? 10 : parseInt(text || "0", 10)
    }
    return 0
  }
}
