"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function updatePostStatus(
  postId: string,
  status: string
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

  const { error } = await supabaseAdmin
    .from("posts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", postId)

  if (error) {
    console.error("Error updating post status:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/community")

  return { error: null }
}

export async function deletePost(postId: string): Promise<{ error: string | null }> {
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
    return { error: "Only admins can delete posts" }
  }

  // Get comment IDs first
  const { data: comments } = await supabaseAdmin
    .from("comments")
    .select("id")
    .eq("post_id", postId)

  // Delete related data
  if (comments && comments.length > 0) {
    const commentIds = comments.map((c) => c.id)
    await supabaseAdmin.from("comment_votes").delete().in("comment_id", commentIds)
  }
  await supabaseAdmin.from("comments").delete().eq("post_id", postId)
  await supabaseAdmin.from("post_votes").delete().eq("post_id", postId)

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", postId)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/community")

  return { error: null }
}
