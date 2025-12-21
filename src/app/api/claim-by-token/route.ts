import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { checkKitClaimAchievements } from "@/lib/achievements"

export async function POST(request: Request) {
  // Rate limit: 5 requests per minute
  const rateLimitResponse = await rateLimit(request, "claimByToken")
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Get the user from the session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to claim a kit" },
        { status: 401 }
      )
    }

    const { token } = (await request.json()) as { token: unknown }

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid claim token" },
        { status: 400 }
      )
    }

    // First, check if the license exists and get customer_email
    const { data: license } = await supabaseAdmin
      .from("licenses")
      .select("id, customer_email, status, owner_id")
      .eq("claim_token", token)
      .single()

    if (!license) {
      // Can't find by token - it was already used or never existed
      return NextResponse.json(
        { error: "Invalid or expired claim link. Please check your email for a valid link." },
        { status: 404 }
      )
    }

    // Check if already claimed
    if (license.status !== "pending") {
      if (license.owner_id === user.id) {
        return NextResponse.json(
          { error: "You have already claimed this kit." },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "This kit has already been claimed by another user." },
        { status: 400 }
      )
    }

    // Check if claimer's email matches purchase email
    const isOriginalPurchaser = license.customer_email?.toLowerCase() === user.email.toLowerCase()

    // Claim the license
    // If claimed by a different user, status becomes 'claimed_by_other' so original purchaser sees it
    const newStatus = isOriginalPurchaser ? "claimed" : "claimed_by_other"

    const { data: claimedLicense, error: claimError } = await supabaseAdmin
      .from("licenses")
      .update({
        owner_id: user.id,
        claimed_at: new Date().toISOString(),
        claim_token: null, // Clear the claim token after claiming
        status: newStatus,
      })
      .eq("id", license.id)
      .eq("status", "pending") // Atomic check
      .select("id, code, product:products(name)")
      .single()

    if (claimError) {
      if (claimError.code === "PGRST116") {
        // Race condition - someone else claimed it
        return NextResponse.json(
          { error: "This kit was just claimed by another user. Please refresh and try again." },
          { status: 400 }
        )
      }

      console.error("Error claiming license by token:", claimError)
      return NextResponse.json(
        { error: "An error occurred. Please try again." },
        { status: 500 }
      )
    }

    const productName =
      (claimedLicense.product as unknown as { name: string } | null)?.name || "Kit"

    // Trigger achievement check asynchronously
    void checkKitClaimAchievements(user.id)

    return NextResponse.json({
      message: `${productName} claimed successfully!`,
      license: {
        id: claimedLicense.id,
        code: claimedLicense.code,
      },
    })
  } catch (error) {
    console.error("Error in claim-by-token:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
