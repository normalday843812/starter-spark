import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { checkKitClaimAchievements } from "@/lib/achievements"

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute
  const rateLimitResponse = await rateLimit(request, "claimLicense")
  if (rateLimitResponse) return rateLimitResponse

  // Get authenticated user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  // Parse request body
  let body: { licenseId?: string; action?: string }
  try {
    body = (await request.json()) as { licenseId?: string; action?: string }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  const { licenseId, action } = body

  if (!licenseId || typeof licenseId !== "string") {
    return NextResponse.json(
      { error: "License ID is required" },
      { status: 400 }
    )
  }

  if (action !== "claim" && action !== "reject") {
    return NextResponse.json(
      { error: "Action must be 'claim' or 'reject'" },
      { status: 400 }
    )
  }

  // Verify the license exists, is pending, and belongs to this user's email
  const { data: license, error: fetchError } = await supabaseAdmin
    .from("licenses")
    .select("id, status, customer_email, owner_id, product_id, products(name)")
    .eq("id", licenseId)
    .single()

  if (fetchError || !license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    )
  }

  // Security check: email must match
  if (license.customer_email?.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "You don't have permission to modify this license" },
      { status: 403 }
    )
  }

  // Check if already processed
  if (license.status !== "pending") {
    if (license.status === "claimed") {
      if (license.owner_id === user.id) {
        return NextResponse.json(
          { error: "You already claimed this license" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "This license was claimed by another account" },
        { status: 400 }
      )
    }
    if (license.status === "rejected") {
      return NextResponse.json(
        { error: "You already rejected this license" },
        { status: 400 }
      )
    }
    if (license.status === "claimed_by_other") {
      return NextResponse.json(
        { error: "This license was claimed by another account" },
        { status: 400 }
      )
    }
  }

  if (action === "claim") {
    // Claim the license
    const { error: updateError } = await supabaseAdmin
      .from("licenses")
      .update({
        status: "claimed",
        owner_id: user.id,
        claimed_at: new Date().toISOString(),
        claim_token: null, // Clear the token
      })
      .eq("id", licenseId)
      .eq("status", "pending") // Atomic check

    if (updateError) {
      console.error("Failed to claim license:", updateError)
      return NextResponse.json(
        { error: "Failed to claim license" },
        { status: 500 }
      )
    }

    // Trigger achievement check asynchronously
    void checkKitClaimAchievements(user.id)

    const productName = (license.products as { name: string } | null)?.name || "Kit"

    return NextResponse.json({
      success: true,
      action: "claimed",
      productName,
      message: `Successfully claimed ${productName}!`,
    })
  } else {
    // Reject the license
    const { error: updateError } = await supabaseAdmin
      .from("licenses")
      .update({
        status: "rejected",
      })
      .eq("id", licenseId)
      .eq("status", "pending") // Atomic check

    if (updateError) {
      console.error("Failed to reject license:", updateError)
      return NextResponse.json(
        { error: "Failed to reject license" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action: "rejected",
      message: "License rejected",
    })
  }
}
