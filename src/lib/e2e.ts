export const isE2E =
  process.env.NEXT_PUBLIC_E2E === "1" ||
  process.env.E2E_TESTS === "1" ||
  process.env.PLAYWRIGHT === "1"

export const E2E_PRODUCT_SLUG = "starter-kit"

export const e2eProductRecord = {
  id: "e2e-starter-kit",
  slug: E2E_PRODUCT_SLUG,
  name: "StarterSpark Starter Kit",
  description: "Build your first robot with a guided kit and hands-on lessons.",
  price_cents: 9900,
  original_price_cents: null,
  discount_percent: null,
  discount_expires_at: null,
  track_inventory: false,
  stock_quantity: null,
  specs: {
    category: "kit",
    badge: "Featured",
    inStock: true,
    learningOutcomes: [
      "Assemble a servo-driven arm",
      "Write and upload Arduino sketches",
      "Understand PWM and basic motion control",
    ],
    includedItems: [
      {
        quantity: 1,
        name: "Controller board",
        description: "Arduino-compatible microcontroller",
      },
      {
        quantity: 4,
        name: "Servo motors",
        description: "High-torque servos for joints",
      },
      {
        quantity: 1,
        name: "Hardware pack",
        description: "Fasteners, brackets, and tools",
      },
    ],
    technicalSpecs: [
      { label: "Build Time", value: "~3 hours" },
      { label: "Skill Level", value: "Beginner" },
      { label: "Age Range", value: "10+" },
    ],
  },
  product_media: [],
  product_tags: [{ tag: "featured" }],
  status: "active",
  created_at: "2025-01-01T00:00:00.000Z",
} as const

export function getE2EProduct(slug?: string) {
  if (!slug || slug === E2E_PRODUCT_SLUG) {
    return e2eProductRecord
  }
  return null
}

export function getE2EShopProducts() {
  return [
    {
      id: e2eProductRecord.id,
      slug: e2eProductRecord.slug,
      name: e2eProductRecord.name,
      price: e2eProductRecord.price_cents / 100,
      inStock: true,
      badge: e2eProductRecord.specs.badge,
      category: e2eProductRecord.specs.category,
      status: e2eProductRecord.status,
      tags: [],
      createdAt: e2eProductRecord.created_at,
      image: undefined,
      originalPrice: null,
      discountPercent: null,
      discountExpiresAt: null,
    },
  ]
}
