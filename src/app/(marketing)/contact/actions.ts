"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

export type ContactFormData = {
  name: string
  email: string
  subject: "general" | "technical" | "educator" | "partnership" | "press"
  message: string
}

export type ContactFormResult = {
  success: boolean
  error?: string
}

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  // Basic validation
  if (!data.name || data.name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters" }
  }

  if (!data.email || !data.email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" }
  }

  if (!data.message || data.message.trim().length < 10) {
    return { success: false, error: "Message must be at least 10 characters" }
  }

  const validSubjects = ["general", "technical", "educator", "partnership", "press"]
  if (!validSubjects.includes(data.subject)) {
    return { success: false, error: "Please select a valid subject" }
  }

  try {
    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject,
      message: data.message.trim(),
    })

    if (error) {
      console.error("Error submitting contact form:", error)
      return { success: false, error: "Failed to submit form. Please try again." }
    }

    // TODO: Send confirmation email to user
    // TODO: Send notification email to team

    return { success: true }
  } catch (err) {
    console.error("Error submitting contact form:", err)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}
