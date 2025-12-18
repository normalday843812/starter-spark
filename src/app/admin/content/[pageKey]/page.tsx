import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ContentEditor } from "./ContentEditor"

type PageParams = Promise<{ pageKey: string }>

export default async function EditContentPage({
  params,
}: {
  params: PageParams
}) {
  const { pageKey } = await params
  const supabase = await createClient()

  // Fetch page content
  const { data: page, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page_key", pageKey)
    .single()

  if (error || !page) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <ContentEditor page={page} />
    </div>
  )
}
