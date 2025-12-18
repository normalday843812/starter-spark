import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleId, isHelpful } = body

    if (!articleId || typeof isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // Call the RPC function to record feedback
    const { error } = await supabaseAdmin.rpc("record_article_feedback", {
      article_id: articleId,
      is_helpful: isHelpful,
    })

    if (error) {
      console.error("Error recording feedback:", error)
      return NextResponse.json(
        { error: "Failed to record feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in feedback endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
