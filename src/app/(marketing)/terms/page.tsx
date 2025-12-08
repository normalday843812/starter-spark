import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import ReactMarkdown from "react-markdown"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "StarterSpark Robotics terms of service - terms and conditions for using our products.",
}

export default async function TermsPage() {
  const supabase = await createClient()

  // Fetch terms of service content
  const { data: page } = await supabase
    .from("page_content")
    .select("title, content, updated_at")
    .eq("page_key", "terms")
    .not("published_at", "is", null)
    .single()

  const lastUpdated = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-32 pb-24 px-6 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-mono text-4xl font-bold text-slate-900 mb-8">
            {page?.title || "Terms of Service"}
          </h1>

          <div className="bg-white rounded border border-slate-200 p-8">
            {page?.content ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{page.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 font-mono text-sm">
                Terms of service content is being updated. Please check back later.
              </p>
            )}
          </div>

          {lastUpdated && (
            <p className="mt-6 text-sm text-slate-500 text-center">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
