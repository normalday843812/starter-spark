"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateLicenseCode } from "@/lib/validation"

export async function revokeLicense(
  licenseId: string
): Promise<{ error: string | null }> {
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
    return { error: "Only admins can revoke licenses" }
  }

  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from("licenses")
    .update({
      owner_id: null,
      claimed_at: null,
    })
    .eq("id", licenseId)

  if (error) {
    console.error("Error revoking license:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/licenses")

  return { error: null }
}

export async function generateLicenses(
  productId: string,
  quantity: number,
  source: "online_purchase" | "physical_card"
): Promise<{ error: string | null; codes: string[] }> {
  const supabase = await createClient()

  // Check if user is admin/staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", codes: [] }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { error: "Unauthorized", codes: [] }
  }

  // Generate unique codes
  const codes: string[] = []
  const maxAttempts = quantity * 3

  for (let i = 0; i < maxAttempts && codes.length < quantity; i++) {
    const code = generateLicenseCode()

    // Check if code already exists
    const { data: existing } = await supabaseAdmin
      .from("licenses")
      .select("id")
      .eq("code", code)
      .single()

    if (!existing) {
      codes.push(code)
    }
  }

  if (codes.length < quantity) {
    return { error: "Could not generate enough unique codes", codes: [] }
  }

  // Insert licenses
  const licensesToInsert = codes.map((code) => ({
    code,
    product_id: productId,
    source,
    owner_id: null,
  }))

  const { error } = await supabaseAdmin.from("licenses").insert(licensesToInsert)

  if (error) {
    console.error("Error generating licenses:", error)
    return { error: error.message, codes: [] }
  }

  revalidatePath("/admin/licenses")

  return { error: null, codes }
}

export async function assignLicense(
  licenseId: string,
  userEmail: string
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

  // Find user by email
  const { data: targetUser } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", userEmail)
    .single()

  if (!targetUser) {
    return { error: "User not found" }
  }

  // Assign license
  const { error } = await supabaseAdmin
    .from("licenses")
    .update({
      owner_id: targetUser.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", licenseId)
    .is("owner_id", null) // Only if unclaimed

  if (error) {
    console.error("Error assigning license:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/licenses")

  return { error: null }
}
