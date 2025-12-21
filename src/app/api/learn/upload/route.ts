import { NextRequest, NextResponse } from "next/server"
import { fileTypeFromBuffer } from "file-type"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit"

// Allowed file types with their magic byte signatures
const ALLOWED_TYPES = {
  // Images
  "image/jpeg": { maxSize: 10 * 1024 * 1024 }, // 10MB
  "image/png": { maxSize: 10 * 1024 * 1024 },
  "image/gif": { maxSize: 10 * 1024 * 1024 },
  "image/webp": { maxSize: 10 * 1024 * 1024 },
  // Videos
  "video/mp4": { maxSize: 100 * 1024 * 1024 }, // 100MB
  "video/webm": { maxSize: 100 * 1024 * 1024 },
  "video/quicktime": { maxSize: 100 * 1024 * 1024 },
} as const

type AllowedMimeType = keyof typeof ALLOWED_TYPES

// Sanitize filename
function sanitizeFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).pop() || "file"
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 100)

  if (!sanitized.includes(".")) {
    return `${sanitized}.bin`
  }
  return sanitized
}

function getExtensionForMimeType(mimeType: AllowedMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/gif":
      return "gif"
    case "image/webp":
      return "webp"
    case "video/mp4":
      return "mp4"
    case "video/webm":
      return "webm"
    case "video/quicktime":
      return "mov"
  }
}

function getAllowedTypeConfig(mimeType: AllowedMimeType): { maxSize: number } {
  switch (mimeType) {
    case "image/jpeg":
      return ALLOWED_TYPES["image/jpeg"]
    case "image/png":
      return ALLOWED_TYPES["image/png"]
    case "image/gif":
      return ALLOWED_TYPES["image/gif"]
    case "image/webp":
      return ALLOWED_TYPES["image/webp"]
    case "video/mp4":
      return ALLOWED_TYPES["video/mp4"]
    case "video/webm":
      return ALLOWED_TYPES["video/webm"]
    case "video/quicktime":
      return ALLOWED_TYPES["video/quicktime"]
  }
}

function generateSecurePath(
  originalFilename: string,
  mimeType: AllowedMimeType,
  lessonId: string,
  assetType: "video" | "image"
): string {
  const timestamp = Date.now()
  const randomId = crypto.randomBytes(16).toString("hex")
  const sanitizedName = sanitizeFilename(originalFilename)
  const ext = getExtensionForMimeType(mimeType) || sanitizedName.split(".").pop() || "bin"

  // Path format: lessons/<lessonId>/<assetType>/randomId_timestamp.ext
  return `lessons/${lessonId}/${assetType}/${randomId}_${timestamp}.${ext}`
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, "learnUpload")
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Check authentication and admin role
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = (profile as { role: string } | null)?.role
    if (userRole !== "admin" && userRole !== "staff") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const lessonId = formData.get("lessonId") as string | null
    const assetType = (formData.get("assetType") as "video" | "image") || "video"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 })
    }

    // Validate file size is not 0
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty files are not allowed" }, { status: 400 })
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Detect actual file type from magic bytes
    const detectedType = await fileTypeFromBuffer(buffer)

    if (!detectedType) {
      return NextResponse.json(
        { error: "Could not determine file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed." },
        { status: 400 }
      )
    }

    // Check if detected type is allowed
    if (!(detectedType.mime in ALLOWED_TYPES)) {
      return NextResponse.json(
        { error: `File type "${detectedType.mime}" is not allowed. Only images and videos are supported.` },
        { status: 400 }
      )
    }

    const mimeType = detectedType.mime as AllowedMimeType
    const typeConfig = getAllowedTypeConfig(mimeType)

    // Check individual file size limit
    if (file.size > typeConfig.maxSize) {
      const maxMB = typeConfig.maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File exceeds ${maxMB}MB limit for ${mimeType.startsWith("video") ? "videos" : "images"}` },
        { status: 400 }
      )
    }

    // Additional validation for images
    if (mimeType.startsWith("image/")) {
      const bufferString = buffer.toString("utf8", 0, Math.min(buffer.length, 1000))
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<\?php/i,
        /<%/i,
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(bufferString)) {
          return NextResponse.json(
            { error: "File contains potentially malicious content" },
            { status: 400 }
          )
        }
      }
    }

    // Generate secure storage path
    const storagePath = generateSecurePath(file.name, mimeType, lessonId, assetType)

    // Upload to Supabase Storage using service role
    const { error: uploadError } = await supabaseAdmin.storage
      .from("learn-assets")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      )
    }

    // Generate a signed URL for 1 year (for lesson content)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from("learn-assets")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365) // 1 year

    if (signedUrlError || !signedUrlData) {
      console.error("Signed URL error:", signedUrlError)
      // Return the path instead if signed URL fails - can be resolved later
      return NextResponse.json(
        {
          success: true,
          path: storagePath,
          type: mimeType,
          size: file.size,
        },
        { headers: rateLimitHeaders("learnUpload") }
      )
    }

    return NextResponse.json(
      {
        success: true,
        url: signedUrlData.signedUrl,
        path: storagePath,
        type: mimeType,
        size: file.size,
      },
      { headers: rateLimitHeaders("learnUpload") }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during upload" },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
