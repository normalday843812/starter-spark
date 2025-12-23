import type { Page } from "@playwright/test"

export async function openFirstProductFromShop(page: Page): Promise<boolean> {
  await page.goto("/shop")
  const productLinks = page.locator('main a[href^="/shop/"]')
  if ((await productLinks.count()) === 0) {
    return false
  }
  const firstLink = productLinks.first()
  await firstLink.waitFor({ state: "visible", timeout: 10000 })
  const href = await firstLink.getAttribute("href")
  if (!href) return false
  await page.goto(href)
  return true
}
