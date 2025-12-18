"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAuditEvent } from "@/lib/audit"

interface UpdateStatInput {
  id: string
  value: number
  label: string
  suffix: string
  is_auto_calculated?: boolean
  auto_source?: string | null
}

export async function updateSiteStat(input: UpdateStatInput) {
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

  // Update the stat
  const updateData: Record<string, unknown> = {
    value: input.value,
    label: input.label,
    suffix: input.suffix || "",
    updated_at: new Date().toISOString(),
  }

  // Include auto_calculated fields if provided
  if (input.is_auto_calculated !== undefined) {
    updateData.is_auto_calculated = input.is_auto_calculated
    updateData.auto_source = input.is_auto_calculated ? (input.auto_source || null) : null
  }

  const { error } = await supabase
    .from("site_stats")
    .update(updateData)
    .eq("id", input.id)

  if (error) {
    console.error("Error updating site stat:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'stats.updated',
    resourceType: 'stats',
    resourceId: input.id,
    details: {
      label: input.label,
      value: input.value,
      suffix: input.suffix,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")

  return { success: true }
}

export async function createSiteStat(input: {
  key: string
  value: number
  label: string
  suffix: string
  is_auto_calculated: boolean
  auto_source?: string | null
}) {
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

  // Get the max sort_order
  const { data: maxOrder } = await supabase
    .from("site_stats")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = (maxOrder?.sort_order || 0) + 1

  // Create the stat
  const { data: stat, error } = await supabase.from("site_stats").insert({
    key: input.key,
    value: input.value,
    label: input.label,
    suffix: input.suffix || "",
    is_auto_calculated: input.is_auto_calculated,
    auto_source: input.is_auto_calculated ? (input.auto_source || null) : null,
    sort_order: nextSortOrder,
  }).select("id").single()

  if (error) {
    console.error("Error creating site stat:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'stats.created',
    resourceType: 'stats',
    resourceId: stat.id,
    details: {
      key: input.key,
      label: input.label,
      value: input.value,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")

  return { success: true }
}

export async function deleteSiteStat(id: string) {
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

  // Get stat info before deleting for audit log
  const { data: stat } = await supabase
    .from("site_stats")
    .select("key, label")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("site_stats").delete().eq("id", id)

  if (error) {
    console.error("Error deleting site stat:", error)
    return { error: error.message }
  }

  // Log audit event
  await logAuditEvent({
    userId: user.id,
    action: 'stats.deleted',
    resourceType: 'stats',
    resourceId: id,
    details: {
      key: stat?.key,
      label: stat?.label,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")

  return { success: true }
}
