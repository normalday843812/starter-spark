import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Package,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CoursePage({
  params,
}: {
  params: Promise<{ product: string }>
}) {
  const { product: productSlug } = await params
  const supabase = await createClient()

  // Fetch course with full curriculum from database
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      difficulty,
      duration_minutes,
      product:products (
        id,
        slug,
        name
      ),
      modules (
        id,
        title,
        description,
        sort_order,
        lessons (
          id,
          slug,
          title,
          description,
          duration_minutes,
          sort_order
        )
      )
    `)
    .eq("products.slug", productSlug)
    .single()

  if (error || !course) {
    notFound()
  }

  const product = course.product as { id: string; slug: string; name: string } | null
  if (!product) {
    notFound()
  }

  // Sort modules and lessons by sort_order
  const sortedModules = course.modules
    ?.sort((a, b) => a.sort_order - b.sort_order)
    .map((mod) => ({
      ...mod,
      lessons: mod.lessons?.sort((a, b) => a.sort_order - b.sort_order) || [],
    })) || []

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user owns this product
  let isOwned = false
  if (user) {
    const { data: license } = await supabase
      .from("licenses")
      .select("id")
      .eq("owner_id", user.id)
      .eq("product_id", product.id)
      .single()

    if (license) {
      isOwned = true
    }
  }

  // Calculate total lessons
  const totalLessons = sortedModules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  )

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Get first lesson slug for "Start Course" button
  const firstLesson = sortedModules[0]?.lessons[0]

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="pt-32 pb-8 px-6 lg:px-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded bg-cyan-50 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-cyan-700" />
                </div>
                {isOwned && (
                  <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">
                    Owned
                  </span>
                )}
              </div>
              <h1 className="font-mono text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span className="capitalize">{course.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formatDuration(course.duration_minutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="lg:w-80 bg-slate-50 rounded border border-slate-200 p-6">
              {isOwned ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-mono text-slate-900 mb-1">
                      0%
                    </div>
                    <p className="text-sm text-slate-500">completed</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-cyan-700 rounded-full"
                      style={{ width: "0%" }}
                    />
                  </div>
                  {firstLesson && (
                    <Link href={`/learn/${product.slug}/${firstLesson.slug}`}>
                      <Button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-mono">
                        Start Course
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Kit required to access lessons
                    </span>
                  </div>
                  <Link href={`/shop/${product.slug}`}>
                    <Button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-mono">
                      Get the Kit
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Already have a kit?{" "}
                    <Link href="/workshop" className="text-cyan-700 hover:underline">
                      Claim your code
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-12 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-mono text-2xl text-slate-900 mb-8">Curriculum</h2>

          <div className="space-y-6">
            {sortedModules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="bg-white rounded border border-slate-200 overflow-hidden"
              >
                {/* Module Header */}
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-mono text-lg text-slate-900 mb-1">
                    Module {moduleIndex + 1}: {module.title}
                  </h3>
                  <p className="text-sm text-slate-600">{module.description}</p>
                </div>

                {/* Lessons */}
                <div className="divide-y divide-slate-100">
                  {module.lessons.map((lesson) => {
                    const isAccessible = isOwned
                    const isCompleted = false // TODO: fetch from lesson_progress

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-4 p-4 ${
                          isAccessible
                            ? "hover:bg-slate-50 cursor-pointer"
                            : "opacity-60"
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : isAccessible ? (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          {isAccessible ? (
                            <Link
                              href={`/learn/${product.slug}/${lesson.slug}`}
                              className="block"
                            >
                              <h4 className="font-medium text-slate-900 hover:text-cyan-700 transition-colors">
                                {lesson.title}
                              </h4>
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {lesson.description}
                              </p>
                            </Link>
                          ) : (
                            <>
                              <h4 className="font-medium text-slate-900">
                                {lesson.title}
                              </h4>
                              <p className="text-sm text-slate-500 line-clamp-1">
                                {lesson.description}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="flex-shrink-0 text-sm text-slate-400 font-mono">
                          {lesson.duration_minutes} min
                        </div>

                        {/* Arrow */}
                        {isAccessible && (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
