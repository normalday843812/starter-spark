"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface UpdateContentData {
  title: string
  content: string
  publish?: boolean
}

export async function updatePageContent(
  pageKey: string,
  data: UpdateContentData
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

  // Get current content to check version
  const { data: existing } = await supabase
    .from("page_content")
    .select("version")
    .eq("page_key", pageKey)
    .single()

  const newVersion = (existing?.version || 0) + 1

  const { error } = await supabase
    .from("page_content")
    .update({
      title: data.title,
      content: data.content,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
      version: newVersion,
      // Only update published_at if explicitly publishing
      ...(data.publish ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("page_key", pageKey)

  if (error) {
    console.error("Error updating page content:", error)
    return { error: error.message }
  }

  // Revalidate the admin page and the public page
  revalidatePath("/admin/content")
  revalidatePath(`/admin/content/${pageKey}`)
  revalidatePath(`/${pageKey}`)

  return { error: null }
}

export async function unpublishPageContent(
  pageKey: string
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
    .from("page_content")
    .update({
      published_at: null,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", pageKey)

  if (error) {
    console.error("Error unpublishing page:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/content")
  revalidatePath(`/admin/content/${pageKey}`)
  revalidatePath(`/${pageKey}`)

  return { error: null }
}
