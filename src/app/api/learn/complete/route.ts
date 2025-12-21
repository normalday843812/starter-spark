import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { checkLessonAchievements } from "@/lib/achievements"
import { after } from "next/server"

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "default")
  if (limited) return limited

  let lessonId: string | null = null

  try {
    const body: unknown = await request.json()
    if (typeof body === "object" && body !== null) {
      const raw = (body as Record<string, unknown>).lessonId
      if (typeof raw === "string") lessonId = raw
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!lessonId || !isUuid(lessonId)) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  )

  if (error) {
    console.error("Error saving lesson progress:", error)
    return NextResponse.json({ error: "Unable to save progress" }, { status: 403 })
  }

  after(async () => {
    try {
      await checkLessonAchievements(user.id, lessonId)
    } catch (err) {
      console.error("Error checking lesson achievements:", err)
    }
  })

  return new NextResponse(null, { status: 204 })
}

