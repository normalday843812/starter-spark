"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Json } from "@/lib/supabase/database.types"

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Course actions
export async function createCourse(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const productId = formData.get("product_id") as string
  const difficulty = formData.get("difficulty") as string
  const durationMinutes = parseInt(formData.get("duration_minutes") as string) || 0

  if (!title || !productId) {
    throw new Error("Title and product are required")
  }

  const slug = generateSlug(title)

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug,
      description,
      product_id: productId,
      difficulty: difficulty || "beginner",
      duration_minutes: durationMinutes,
      is_published: false,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating course:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/learn")
  redirect(`/admin/learn/${data.id}`)
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const difficulty = formData.get("difficulty") as string
  const durationMinutes = parseInt(formData.get("duration_minutes") as string) || 0
  const isPublished = formData.get("is_published") === "true"

  const slug = generateSlug(title)

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug,
      description,
      difficulty,
      duration_minutes: durationMinutes,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)

  if (error) {
    console.error("Error updating course:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/learn")
  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("courses").delete().eq("id", courseId)

  if (error) {
    console.error("Error deleting course:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/learn")
  redirect("/admin/learn")
}

// Module actions
export async function createModule(courseId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const icon = formData.get("icon") as string

  if (!title) {
    return { error: "Title is required" }
  }

  // Get the highest sort_order for this course
  const { data: existingModules } = await supabase
    .from("modules")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextSortOrder = existingModules?.[0]?.sort_order !== undefined
    ? existingModules[0].sort_order + 1
    : 0

  const slug = generateSlug(title)

  const { data, error } = await supabase
    .from("modules")
    .insert({
      course_id: courseId,
      title,
      slug,
      description,
      icon: icon || null,
      sort_order: nextSortOrder,
      is_published: true,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating module:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true, moduleId: data.id }
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const icon = formData.get("icon") as string
  const isPublished = formData.get("is_published") === "true"

  const slug = generateSlug(title)

  const { error } = await supabase
    .from("modules")
    .update({
      title,
      slug,
      description,
      icon: icon || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId)

  if (error) {
    console.error("Error updating module:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

export async function deleteModule(moduleId: string, courseId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("modules").delete().eq("id", moduleId)

  if (error) {
    console.error("Error deleting module:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const supabase = await createClient()

  // Update each module's sort_order
  const updates = moduleIds.map((id, index) =>
    supabase
      .from("modules")
      .update({ sort_order: index })
      .eq("id", id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    console.error("Error reordering modules:", errors)
    return { error: "Failed to reorder modules" }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

// Lesson actions
export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const lessonType = (formData.get("lesson_type") as string) || "content"

  if (!title) {
    return { error: "Title is required" }
  }

  // Get the highest sort_order for this module
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextSortOrder = existingLessons?.[0]?.sort_order !== undefined
    ? existingLessons[0].sort_order + 1
    : 0

  const slug = generateSlug(title)

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      slug,
      description,
      lesson_type: lessonType,
      sort_order: nextSortOrder,
      is_published: true,
      difficulty: "beginner",
      estimated_minutes: 15,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating lesson:", error)
    return { error: error.message }
  }

  const { error: contentError } = await supabase.from("lesson_content").insert({
    lesson_id: data.id,
    content: "",
    content_blocks: [],
    downloads: [],
  })
  if (contentError) {
    console.error("Error creating lesson content:", contentError)
    return { error: contentError.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true, lessonId: data.id }
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const content = (formData.get("content") as string) || ""
  const lessonType = (formData.get("lesson_type") as string) || "content"
  const difficulty = (formData.get("difficulty") as string) || "beginner"
  const estimatedMinutes = parseInt(formData.get("estimated_minutes") as string) || 15
  const isPublished = formData.get("is_published") === "true"
  const isOptional = formData.get("is_optional") === "true"
  const videoUrl = formData.get("video_url") as string
  const codeStarter = formData.get("code_starter") as string
  const codeSolution = formData.get("code_solution") as string
  const prerequisitesRaw = formData.get("prerequisites") as string

  const contentBlocksRaw = formData.get("content_blocks") as string
  let contentBlocks: Json[] = []
  if (contentBlocksRaw) {
    try {
      const parsed: unknown = JSON.parse(contentBlocksRaw)
      if (Array.isArray(parsed)) {
        contentBlocks = parsed as Json[]
      }
    } catch {
      // Keep empty array
    }
  }

  let prerequisites: string[] | null = null
  if (prerequisitesRaw) {
    try {
      const parsed: unknown = JSON.parse(prerequisitesRaw)
      const isStringArray = (value: unknown): value is string[] =>
        Array.isArray(value) && value.every((v) => typeof v === "string")
      if (isStringArray(parsed)) prerequisites = parsed
    } catch {
      prerequisites = null
    }
  }

  const slug = generateSlug(title)

  const { error: metaError } = await supabase
    .from("lessons")
    .update({
      title,
      slug,
      description,
      lesson_type: lessonType,
      difficulty,
      estimated_minutes: estimatedMinutes,
      is_published: isPublished,
      is_optional: isOptional,
      prerequisites,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)

  if (metaError) {
    console.error("Error updating lesson metadata:", metaError)
    return { error: metaError.message }
  }

  const { error: contentError } = await supabase
    .from("lesson_content")
    .upsert(
      {
        lesson_id: lessonId,
        content,
        content_blocks: contentBlocks,
        video_url: videoUrl || null,
        code_starter: codeStarter || null,
        code_solution: codeSolution || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id" }
    )

  if (contentError) {
    console.error("Error updating lesson content:", contentError)
    return { error: contentError.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

  if (error) {
    console.error("Error deleting lesson:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}

export async function reorderLessons(moduleId: string, courseId: string, lessonIds: string[]) {
  const supabase = await createClient()

  const updates = lessonIds.map((id, index) =>
    supabase
      .from("lessons")
      .update({ sort_order: index })
      .eq("id", id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    console.error("Error reordering lessons:", errors)
    return { error: "Failed to reorder lessons" }
  }

  revalidatePath(`/admin/learn/${courseId}`)
  return { success: true }
}
