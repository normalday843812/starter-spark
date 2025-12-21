"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Reorder, useDragControls } from "motion/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Save,
  Trash2,
  Plus,
  GripVertical,
  FileText,
  Code,
  Blocks,
  HelpCircle,
  Wrench,
  ChevronRight,
  ChevronDown,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  deleteLesson,
  reorderModules,
  reorderLessons,
} from "../actions"

interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  lesson_type: string
  difficulty: string
  estimated_minutes: number
  is_published: boolean
  is_optional: boolean
  sort_order: number
}

interface Module {
  id: string
  title: string
  slug: string | null
  description: string | null
  icon: string | null
  is_published: boolean
  sort_order: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string | null
  description: string | null
  difficulty: string
  duration_minutes: number
  is_published: boolean
  icon: string | null
  cover_image_url: string | null
  product: {
    id: string
    name: string
    slug: string
  } | null
  modules: Module[]
}

interface CourseEditorProps {
  course: Course
}

const lessonTypeIcons: Record<string, typeof FileText> = {
  content: FileText,
  code_challenge: Code,
  visual_challenge: Blocks,
  quiz: HelpCircle,
  project: Wrench,
}

const lessonTypeLabels: Record<string, string> = {
  content: "Content",
  code_challenge: "Code Challenge",
  visual_challenge: "Visual Challenge",
  quiz: "Quiz",
  project: "Project",
}

export function CourseEditor({ course }: CourseEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newModuleOpen, setNewModuleOpen] = useState(false)
  const [courseDifficulty, setCourseDifficulty] = useState(course.difficulty)
  const [coursePublished, setCoursePublished] = useState(course.is_published)
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(
    () => new Set(course.modules.map((m) => m.id))
  )
  const [moduleOrder, setModuleOrder] = useState<string[]>(() =>
    course.modules.map((m) => m.id)
  )
  const [lessonOrderByModule, setLessonOrderByModule] = useState<
    Record<string, string[]>
  >(() => {
    const initial: Record<string, string[]> = {}
    for (const mod of course.modules) {
      initial[mod.id] = mod.lessons.map((l) => l.id)
    }
    return initial
  })
  const moduleOrderDirty = useRef(false)
  const moduleIdsRef = useRef<string[]>([])
  const orderedModules = useMemo(() => {
    const byId = new Map(course.modules.map((m) => [m.id, m]))
    const seen = new Set<string>()
    const base: Module[] = []

    for (const id of moduleOrder) {
      const mod = byId.get(id)
      if (!mod) continue
      base.push(mod)
      seen.add(id)
    }
    for (const mod of course.modules) {
      if (!seen.has(mod.id)) base.push(mod)
    }

    return base.map((mod) => {
      const desiredOrder = lessonOrderByModule[mod.id] || mod.lessons.map((l) => l.id)
      const lessonById = new Map(mod.lessons.map((l) => [l.id, l]))
      const seenLessons = new Set<string>()
      const orderedLessons: Lesson[] = []
      for (const id of desiredOrder) {
        const l = lessonById.get(id)
        if (!l) continue
        orderedLessons.push(l)
        seenLessons.add(id)
      }
      for (const l of mod.lessons) {
        if (!seenLessons.has(l.id)) orderedLessons.push(l)
      }
      return { ...mod, lessons: orderedLessons }
    })
  }, [course.modules, lessonOrderByModule, moduleOrder])

  const moduleIds = useMemo(() => orderedModules.map((m) => m.id), [orderedModules])

  useEffect(() => {
    moduleIdsRef.current = moduleIds
  }, [moduleIds])

  const handleSaveCourse = async (formData: FormData) => {
    setSaving(true)
    await updateCourse(course.id, formData)
    setSaving(false)
    router.refresh()
  }

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all modules and lessons.")) {
      return
    }
    setDeleting(true)
    await deleteCourse(course.id)
  }

  const handleCreateModule = async (formData: FormData) => {
    await createModule(course.id, formData)
    setNewModuleOpen(false)
    router.refresh()
  }

  const handleUpdateModule = async (moduleId: string, formData: FormData) => {
    await updateModule(moduleId, course.id, formData)
    router.refresh()
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) {
      return
    }
    await deleteModule(moduleId, course.id)
    router.refresh()
  }

  const handleCreateLesson = async (moduleId: string, formData: FormData) => {
    await createLesson(moduleId, course.id, formData)
    router.refresh()
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return
    }
    await deleteLesson(lessonId, course.id)
    router.refresh()
  }

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const handleModuleReorder = (nextOrder: string[]) => {
    moduleOrderDirty.current = true
    setModuleOrder(nextOrder)
  }

  const persistModuleOrder = async () => {
    if (!moduleOrderDirty.current) return
    moduleOrderDirty.current = false
    await reorderModules(course.id, moduleIdsRef.current)
    router.refresh()
  }

  const handleLessonReorder = (moduleId: string, nextLessonIds: string[]) => {
    setLessonOrderByModule((prev) => ({ ...prev, [moduleId]: nextLessonIds }))
  }

  const persistLessonOrder = async (moduleId: string, lessonIds: string[]) => {
    await reorderLessons(moduleId, course.id, lessonIds)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Course Settings */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-mono text-lg font-semibold text-slate-900">Course Settings</h2>
        </div>
        <form action={handleSaveCourse} className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={course.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={courseDifficulty} onValueChange={setCourseDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="difficulty" value={courseDifficulty} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={course.description || ""}
              rows={3}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={0}
                defaultValue={course.duration_minutes}
              />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <Switch
                id="is_published"
                checked={coursePublished}
                onCheckedChange={setCoursePublished}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Published
              </Label>
              <input type="hidden" name="is_published" value={coursePublished ? "true" : "false"} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteCourse()}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete Course"}
            </Button>
            <Button type="submit" className="bg-cyan-700 hover:bg-cyan-600" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Modules & Lessons */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-mono text-lg font-semibold text-slate-900">
            Modules & Lessons
          </h2>
          <Dialog open={newModuleOpen} onOpenChange={setNewModuleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyan-700 hover:bg-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Module</DialogTitle>
                <DialogDescription>
                  Create a new module for this course
                </DialogDescription>
              </DialogHeader>
	              <form action={handleCreateModule} className="space-y-4">
	                <div className="space-y-2">
	                  <Label htmlFor="module-title">Title</Label>
	                  <Input
	                    id="module-title"
	                    name="title"
	                    placeholder="Getting Started"
	                    required
	                  />
	                </div>
	                <div className="space-y-2">
	                  <Label htmlFor="module-icon">Icon (optional)</Label>
	                  <Input
	                    id="module-icon"
	                    name="icon"
	                    placeholder="lucide icon name, emoji, etc."
	                  />
	                </div>
	                <div className="space-y-2">
	                  <Label htmlFor="module-description">Description</Label>
	                  <Textarea
	                    id="module-description"
	                    name="description"
                    placeholder="Introduction to the basics..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewModuleOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-cyan-700 hover:bg-cyan-600">
                    Create Module
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-6">
          {orderedModules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No modules yet. Click &quot;Add Module&quot; to get started.
            </div>
          ) : (
            <Reorder.Group
              as="div"
              axis="y"
              values={moduleIds}
              onReorder={handleModuleReorder}
              className="space-y-4"
            >
              {orderedModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  courseId={course.id}
                  expanded={expandedModuleIds.has(module.id)}
                  onToggleExpanded={() => toggleModuleExpanded(module.id)}
                  onUpdateModule={handleUpdateModule}
                  onDeleteModule={() => void handleDeleteModule(module.id)}
                  onCreateLesson={(formData) => handleCreateLesson(module.id, formData)}
                  onDeleteLesson={(lessonId) => void handleDeleteLesson(lessonId)}
                  onLessonReorder={handleLessonReorder}
                  onPersistLessonOrder={persistLessonOrder}
                  onPersistModuleOrder={persistModuleOrder}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  module,
  courseId,
  expanded,
  onToggleExpanded,
  onUpdateModule,
  onDeleteModule,
  onCreateLesson,
  onDeleteLesson,
  onLessonReorder,
  onPersistLessonOrder,
  onPersistModuleOrder,
}: {
  module: Module
  courseId: string
  expanded: boolean
  onToggleExpanded: () => void
  onUpdateModule: (moduleId: string, formData: FormData) => Promise<void>
  onDeleteModule: () => void
  onCreateLesson: (formData: FormData) => Promise<void>
  onDeleteLesson: (lessonId: string) => void
  onLessonReorder: (moduleId: string, nextLessonIds: string[]) => void
  onPersistLessonOrder: (moduleId: string, lessonIds: string[]) => Promise<void>
  onPersistModuleOrder: () => Promise<void>
}) {
  const dragControls = useDragControls()
  const [modulePublished, setModulePublished] = useState(module.is_published)
  const [newLessonType, setNewLessonType] = useState<string>("content")
  const lessonIds = useMemo(() => module.lessons.map((l) => l.id), [module.lessons])
  const lessonIdsRef = useRef<string[]>(lessonIds)

  useEffect(() => {
    lessonIdsRef.current = lessonIds
  }, [lessonIds])

  return (
    <Reorder.Item
      as="div"
      value={module.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={() => void onPersistModuleOrder()}
      className="rounded-lg border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
          aria-label="Reorder module"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <span className="font-medium text-slate-900 truncate">{module.title}</span>
          <Badge variant="outline" className="ml-2">
            {module.lessons.length} lessons
          </Badge>
          {!module.is_published && (
            <Badge variant="outline" className="text-slate-500">
              <EyeOff className="mr-1 h-3 w-3" />
              Draft
            </Badge>
          )}
        </button>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" aria-label="Edit module">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>Update module details and publishing status.</DialogDescription>
            </DialogHeader>
            <form action={(formData) => onUpdateModule(module.id, formData)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`module-title-${module.id}`}>Title</Label>
                <Input id={`module-title-${module.id}`} name="title" defaultValue={module.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`module-icon-${module.id}`}>Icon (optional)</Label>
                <Input
                  id={`module-icon-${module.id}`}
                  name="icon"
                  defaultValue={module.icon || ""}
                  placeholder="lucide icon name, emoji, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`module-description-${module.id}`}>Description</Label>
                <Textarea
                  id={`module-description-${module.id}`}
                  name="description"
                  defaultValue={module.description || ""}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id={`module-published-${module.id}`}
                  checked={modulePublished}
                  onCheckedChange={setModulePublished}
                />
                <Label htmlFor={`module-published-${module.id}`} className="cursor-pointer">
                  Published
                </Label>
                <input
                  type="hidden"
                  name="is_published"
                  value={modulePublished ? "true" : "false"}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-cyan-700 hover:bg-cyan-600">
                  Save Module
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDeleteModule}
          aria-label="Delete module"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Lesson</DialogTitle>
                  <DialogDescription>Add a lesson to {module.title}</DialogDescription>
                </DialogHeader>
                <form action={onCreateLesson} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`lesson-title-${module.id}`}>Title</Label>
                    <Input id={`lesson-title-${module.id}`} name="title" placeholder="Introduction" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lesson-type-${module.id}`}>Type</Label>
                    <Select value={newLessonType} onValueChange={setNewLessonType}>
                      <SelectTrigger id={`lesson-type-${module.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="code_challenge">Code Challenge</SelectItem>
                        <SelectItem value="visual_challenge">Visual Challenge</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="lesson_type" value={newLessonType} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lesson-description-${module.id}`}>Description</Label>
                    <Textarea
                      id={`lesson-description-${module.id}`}
                      name="description"
                      placeholder="Brief description..."
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-cyan-700 hover:bg-cyan-600">
                      Create Lesson
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {module.lessons.length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No lessons in this module yet.</p>
          ) : (
            <Reorder.Group
              as="div"
              axis="y"
              values={lessonIds}
              onReorder={(next) => onLessonReorder(module.id, next)}
              className="space-y-2"
            >
              {module.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  courseId={courseId}
                  onDelete={() => onDeleteLesson(lesson.id)}
                  onPersistOrder={() => void onPersistLessonOrder(module.id, lessonIdsRef.current)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      )}
    </Reorder.Item>
  )
}

function LessonRow({
  lesson,
  courseId,
  onDelete,
  onPersistOrder,
}: {
  lesson: Lesson
  courseId: string
  onDelete: () => void
  onPersistOrder: () => void
}) {
  const dragControls = useDragControls()
  const Icon = lessonTypeIcons[lesson.lesson_type] || FileText

  return (
    <Reorder.Item
      as="div"
      value={lesson.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onPersistOrder}
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
        aria-label="Reorder lesson"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className="h-4 w-4 text-cyan-600" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{lesson.title}</p>
        <p className="text-xs text-slate-500">
          {lessonTypeLabels[lesson.lesson_type]} &middot; {lesson.estimated_minutes} min
        </p>
      </div>
      <div className="flex items-center gap-2">
        {lesson.is_published ? (
          <Eye className="h-4 w-4 text-green-500" />
        ) : (
          <EyeOff className="h-4 w-4 text-slate-400" />
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
          aria-label="Delete lesson"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <a href={`/admin/learn/${courseId}/lesson/${lesson.id}`} aria-label="Edit lesson">
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </Reorder.Item>
  )
}
