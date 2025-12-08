import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "./ProductForm"
import { Database } from "@/lib/supabase/database.types"

type ProductTagType = Database["public"]["Enums"]["product_tag_type"]

export const metadata = {
  title: "Edit Product | Admin",
}

async function getProduct(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_tags (
        tag,
        priority,
        discount_percent
      )
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    return null
  }

  return data
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Transform tags for the form
  const tags = (product.product_tags || []).map((t) => ({
    tag: t.tag as ProductTagType,
    priority: t.priority,
    discount_percent: t.discount_percent,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-slate-600">Update product details</p>
      </div>
      <ProductForm product={product} initialTags={tags} />
    </div>
  )
}
