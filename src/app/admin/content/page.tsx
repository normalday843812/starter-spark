import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, Edit, Users, Info, BookOpen } from "lucide-react"
import Link from "next/link"

// Page metadata for display
const PAGE_METADATA: Record<string, { title: string; description: string; icon: typeof FileText }> = {
  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use, and protect user data",
    icon: FileText,
  },
  terms: {
    title: "Terms of Service",
    description: "Legal terms for using our products and services",
    icon: FileText,
  },
  about_hero: {
    title: "About Page Hero",
    description: "Main headline and description on the About page",
    icon: Info,
  },
  about_story: {
    title: "Our Story",
    description: "The story section on the About page",
    icon: BookOpen,
  },
}

export default async function ContentPage() {
  const supabase = await createClient()

  // Fetch all page content (admin can see drafts too)
  const { data: pages, error } = await supabase
    .from("page_content")
    .select("*")
    .order("page_key")

  // Fetch team member count
  const { count: teamCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching pages:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-mono text-slate-900">Content Management</h1>
        <p className="text-slate-600">Edit static pages, team profiles, and site content</p>
      </div>

      {/* Team Members Section */}
      <div>
        <h2 className="text-lg font-mono text-slate-900 mb-4">Team</h2>
        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-100 rounded">
                <Users className="h-5 w-5 text-cyan-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>Manage team profiles shown on the About page</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
              {teamCount || 0} members
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Add, edit, and reorder team member profiles
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/content/team">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Content Section */}
      <div>
        <h2 className="text-lg font-mono text-slate-900 mb-4">Pages</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {(pages || []).map((page) => {
          const meta = PAGE_METADATA[page.page_key] || {
            title: page.title,
            description: "Editable page content",
            icon: FileText,
          }
          const Icon = meta.icon
          const isPublished = !!page.published_at
          const lastUpdated = page.updated_at
            ? new Date(page.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null

          return (
            <Card key={page.id} className="bg-white border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{meta.title}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isPublished
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                >
                  {isPublished ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </>
                  ) : (
                    "Draft"
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    {lastUpdated ? `Updated ${lastUpdated}` : "Never updated"}
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/content/${page.page_key}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(!pages || pages.length === 0) && (
        <Card className="bg-white border-slate-200">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">No editable pages found.</p>
            <p className="text-sm text-slate-500 mt-1">
              Pages will appear here once the database is seeded.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
