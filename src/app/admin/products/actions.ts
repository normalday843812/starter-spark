"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/supabase/database.types"
import { logAuditEvent } from "@/lib/audit"

type ProductTagType = Database["public"]["Enums"]["product_tag_type"]

interface ProductData {
  name: string
  slug: string
  description: string | null
  price_cents: number
  stripe_price_id: string | null
  specs: Record<string, string> | null
  // Discount fields (Phase 14.3)
  discount_percent: number | null
  discount_expires_at: string | null
  original_price_cents: number | null
  // Inventory fields (Phase 14.4)
  track_inventory: boolean
  stock_quantity: number | null
  low_stock_threshold: number | null
}

interface TagData {
  tag: ProductTagType
  priority: number | null
  discount_percent: number | null
}

export async function updateProduct(
  id: string,
  data: ProductData
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Check if user is admin/staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price_cents: data.price_cents,
      stripe_price_id: data.stripe_price_id,
      specs: data.specs,
      // Discount fields (Phase 14.3)
      discount_percent: data.discount_percent,
      discount_expires_at: data.discount_expires_at,
      original_price_cents: data.original_price_cents,
      // Inventory fields (Phase 14.4)
      track_inventory: data.track_inventory,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'product.updated',
    resourceType: 'product',
    resourceId: id,
    details: {
      name: data.name,
      slug: data.slug,
      priceCents: data.price_cents,
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")

  return { error: null }
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can delete products" }
  }

  // Check if product has any licenses
  const { count } = await supabase
    .from("licenses")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id)

  if (count && count > 0) {
    return { error: "Cannot delete product with existing licenses" }
  }

  // Get product info before deleting for audit log
  const { data: product } = await supabase
    .from("products")
    .select("name, slug")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'product.deleted',
    resourceType: 'product',
    resourceId: id,
    details: {
      name: product?.name,
      slug: product?.slug,
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")

  return { error: null }
}

export async function createProduct(
  data: ProductData
): Promise<{ error: string | null; id: string | null }> {
  const supabase = await createClient()

  // Check if user is admin/staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", id: null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Unauthorized", id: null }
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price_cents: data.price_cents,
      stripe_price_id: data.stripe_price_id,
      specs: data.specs,
      // Discount fields (Phase 14.3)
      discount_percent: data.discount_percent,
      discount_expires_at: data.discount_expires_at,
      original_price_cents: data.original_price_cents,
      // Inventory fields (Phase 14.4)
      track_inventory: data.track_inventory,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating product:", error)
    return { error: error.message, id: null }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'product.created',
    resourceType: 'product',
    resourceId: product.id,
    details: {
      name: data.name,
      slug: data.slug,
      priceCents: data.price_cents,
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")

  return { error: null, id: product.id }
}

export async function updateProductTags(
  productId: string,
  tags: TagData[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Check if user is admin/staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Unauthorized" }
  }

  // Delete existing tags for this product
  const { error: deleteError } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId)

  if (deleteError) {
    console.error("Error deleting existing tags:", deleteError)
    return { error: deleteError.message }
  }

  // Insert new tags if any
  if (tags.length > 0) {
    const { error: insertError } = await supabase
      .from("product_tags")
      .insert(
        tags.map((t) => ({
          product_id: productId,
          tag: t.tag,
          priority: t.priority,
          discount_percent: t.discount_percent,
        }))
      )

    if (insertError) {
      console.error("Error inserting tags:", insertError)
      return { error: insertError.message }
    }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'product.tags_updated',
    resourceType: 'product',
    resourceId: productId,
    details: {
      tags: tags.map(t => t.tag),
      tagCount: tags.length,
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath("/")

  return { error: null }
}
