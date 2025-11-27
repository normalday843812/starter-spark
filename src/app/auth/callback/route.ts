import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const claimToken = searchParams.get("claim")
  const redirectTo = searchParams.get("redirect")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const user = data.user

    // If there's a claim token, claim the license
    if (claimToken && user) {
      try {
        // Atomically claim the license using the claim token
        const { data: claimedLicense, error: claimError } = await supabaseAdmin
          .from("licenses")
          .update({
            owner_id: user.id,
            claimed_at: new Date().toISOString(),
            claim_token: null, // Clear the claim token after claiming
          })
          .eq("claim_token", claimToken)
          .is("owner_id", null) // Only claim if not already claimed
          .select("id, code, product:products(name)")
          .single()

        if (claimError) {
          console.error("Claim error:", claimError)
          // Still redirect, but the user can claim manually later
        } else if (claimedLicense) {
          console.log(`License ${claimedLicense.code} claimed by user ${user.id}`)
        }
      } catch (err) {
        console.error("Error claiming license:", err)
      }

      // Redirect to workshop after claiming
      return NextResponse.redirect(`${origin}/workshop?claimed=true`)
    }

    // Redirect to the requested page or default to workshop
    const destination = redirectTo || "/workshop"
    return NextResponse.redirect(`${origin}${destination}`)
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
