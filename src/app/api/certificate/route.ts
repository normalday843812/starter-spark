import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import { getContent } from "@/lib/content"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const courseId = request.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
  }

  // Fetch course details
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, difficulty")
    .eq("id", courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  // Verify user completed the course (check all required lessons)
  const { data: modules } = await supabase
    .from("modules")
    .select("id, lessons(id, is_optional)")
    .eq("course_id", courseId)

  const requiredLessonIds = (modules ?? [])
    .flatMap((m) => {
      const lessons = m.lessons as { id: string; is_optional: boolean | null }[] | null
      return (lessons ?? []).filter((l) => !l.is_optional).map((l) => l.id)
    })

  if (requiredLessonIds.length === 0) {
    return NextResponse.json({ error: "Course has no lessons" }, { status: 400 })
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .in("lesson_id", requiredLessonIds)
    .not("completed_at", "is", null)

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id))
  const allCompleted = requiredLessonIds.every((id) => completedIds.has(id))

  if (!allCompleted) {
    return NextResponse.json(
      { error: "Course not completed", completed: completedIds.size, total: requiredLessonIds.length },
      { status: 403 }
    )
  }

  // Get user profile for name
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, full_name")
    .eq("id", user.id)
    .single()

  const profile = profileData as { display_name: string | null; full_name: string | null } | null
  const userName = profile?.full_name || profile?.display_name || user.email?.split("@")[0] || "Learner"

  // Generate certificate PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Border
  doc.setDrawColor(14, 116, 144) // cyan-700
  doc.setLineWidth(2)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Inner border
  doc.setLineWidth(0.5)
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

  // Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(14, 116, 144) // cyan-700
  doc.text("STARTERSPARK ROBOTICS", pageWidth / 2, 35, { align: "center" })

  // Certificate title
  doc.setFontSize(36)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text("Certificate of Completion", pageWidth / 2, 55, { align: "center" })

  // Decorative line
  doc.setDrawColor(14, 116, 144)
  doc.setLineWidth(1)
  doc.line(pageWidth / 2 - 60, 62, pageWidth / 2 + 60, 62)

  // "This certifies that"
  doc.setFont("helvetica", "normal")
  doc.setFontSize(14)
  doc.setTextColor(71, 85, 105) // slate-600
  doc.text("This certifies that", pageWidth / 2, 80, { align: "center" })

  // User name
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.setTextColor(15, 23, 42)
  doc.text(userName, pageWidth / 2, 95, { align: "center" })

  // "has successfully completed"
  doc.setFont("helvetica", "normal")
  doc.setFontSize(14)
  doc.setTextColor(71, 85, 105)
  doc.text("has successfully completed the course", pageWidth / 2, 112, { align: "center" })

  // Course title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(14, 116, 144)
  doc.text(course.title, pageWidth / 2, 128, { align: "center" })

  // Difficulty badge
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`Difficulty: ${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}`, pageWidth / 2, 140, {
    align: "center",
  })

  // Date
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.setFontSize(12)
  doc.text(`Completed on ${completionDate}`, pageWidth / 2, 155, { align: "center" })

  // Footer - use dynamic charity content
  const charityMessage = await getContent(
    "global.charity.full",
    "70% of every purchase supports Hawaii youth robotics education"
  )
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text(charityMessage, pageWidth / 2, pageHeight - 20, {
    align: "center",
  })

  // Generate PDF buffer
  const pdfBuffer = doc.output("arraybuffer")

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${course.title.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  })
}
