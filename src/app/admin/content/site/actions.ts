"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAuditEvent } from "@/lib/audit"

export async function updateSiteContent(
  id: string,
  content: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  // Get current content for audit log
  const { data: existingContent } = await supabase
    .from("site_content")
    .select("content_key, content, category")
    .eq("id", id)
    .single()

  // Update the content
  const { error } = await supabase
    .from("site_content")
    .update({
      content,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating site content:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: "site_content.updated",
    resourceType: "site_content",
    resourceId: id,
    details: {
      content_key: existingContent?.content_key,
      category: existingContent?.category,
      previous_content: existingContent?.content?.substring(0, 100),
      new_content: content.substring(0, 100),
    },
  })

  // Revalidate relevant paths based on category
  const category = existingContent?.category
  if (category === "global") {
    revalidatePath("/", "layout")
  } else if (category === "homepage") {
    revalidatePath("/")
  } else if (category === "shop") {
    revalidatePath("/shop")
  } else if (category === "events") {
    revalidatePath("/events")
  } else if (category === "community") {
    revalidatePath("/community")
  } else if (category === "learn") {
    revalidatePath("/learn")
  } else if (category === "workshop") {
    revalidatePath("/workshop")
  } else if (category === "cart") {
    revalidatePath("/cart")
  }

  revalidatePath("/admin/content/site")

  return { error: null }
}

export async function resetSiteContentToDefault(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  // Get the default value
  const { data: existingContent } = await supabase
    .from("site_content")
    .select("content_key, content, default_value, category")
    .eq("id", id)
    .single()

  if (!existingContent?.default_value) {
    return { error: "No default value available" }
  }

  // Reset to default
  const { error } = await supabase
    .from("site_content")
    .update({
      content: existingContent.default_value,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error resetting site content:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: "site_content.reset",
    resourceType: "site_content",
    resourceId: id,
    details: {
      content_key: existingContent.content_key,
      category: existingContent.category,
      previous_content: existingContent.content?.substring(0, 100),
      reset_to: existingContent.default_value.substring(0, 100),
    },
  })

  // Revalidate
  revalidatePath("/")
  revalidatePath("/admin/content/site")

  return { error: null }
}
