"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface TeamMemberData {
  name: string
  role: string
  bio: string
  image_url: string
  social_links: {
    github?: string
    linkedin?: string
    twitter?: string
  }
  is_active: boolean
}

export async function createTeamMember(data: TeamMemberData) {
  const supabase = await createClient()

  // Get the highest sort_order
  const { data: lastMember } = await supabase
    .from("team_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = (lastMember?.sort_order || 0) + 1

  const { data: member, error } = await supabase
    .from("team_members")
    .insert({
      ...data,
      sort_order: nextSortOrder,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/content/team")
  revalidatePath("/about")
  return { success: true, member }
}

export async function updateTeamMember(id: string, data: Partial<TeamMemberData>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("team_members")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/content/team")
  revalidatePath("/about")
  return { success: true }
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/content/team")
  revalidatePath("/about")
  return { success: true }
}

export async function reorderTeamMembers(orderedIds: string[]) {
  const supabase = await createClient()

  // Update sort_order for each member
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("team_members")
      .update({ sort_order: index + 1 })
      .eq("id", id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some((r) => r.error)

  if (hasError) {
    return { success: false, error: "Failed to reorder team members" }
  }

  revalidatePath("/admin/content/team")
  revalidatePath("/about")
  return { success: true }
}
