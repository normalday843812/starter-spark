"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function createEvent(formData: {
  title: string
  slug: string
  description?: string
  location: string
  address?: string
  event_date: string
  end_date?: string
  event_type: string
  rsvp_url?: string
  image_url?: string
  capacity?: number
  is_public: boolean
}): Promise<{ error: string | null }> {
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

  const { error } = await supabaseAdmin.from("events").insert({
    ...formData,
    capacity: formData.capacity || null,
  })

  if (error) {
    console.error("Error creating event:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/events")
  revalidatePath("/events")

  return { error: null }
}

export async function updateEvent(
  eventId: string,
  formData: {
    title: string
    slug: string
    description?: string
    location: string
    address?: string
    event_date: string
    end_date?: string
    event_type: string
    rsvp_url?: string
    image_url?: string
    capacity?: number
    is_public: boolean
  }
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
    .from("events")
    .update({
      ...formData,
      capacity: formData.capacity || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)

  if (error) {
    console.error("Error updating event:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/events")
  revalidatePath("/events")

  return { error: null }
}

export async function deleteEvent(eventId: string): Promise<{ error: string | null }> {
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
    return { error: "Only admins can delete events" }
  }

  const { error } = await supabaseAdmin.from("events").delete().eq("id", eventId)

  if (error) {
    console.error("Error deleting event:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/events")
  revalidatePath("/events")

  return { error: null }
}
