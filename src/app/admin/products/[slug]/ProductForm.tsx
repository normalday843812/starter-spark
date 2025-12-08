"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Trash2, Plus, X } from "lucide-react"
import { updateProduct, deleteProduct, updateProductTags } from "../actions"
import { Database } from "@/lib/supabase/database.types"

type ProductTagType = Database["public"]["Enums"]["product_tag_type"]

const ALL_TAGS: { type: ProductTagType; label: string; description: string }[] = [
  { type: "featured", label: "Featured", description: "Highlights product in the shop" },
  { type: "new", label: "New", description: "Recently added product" },
  { type: "bestseller", label: "Bestseller", description: "Top selling product" },
  { type: "discount", label: "Discount", description: "Product is on sale" },
  { type: "limited", label: "Limited", description: "Limited availability" },
  { type: "bundle", label: "Bundle", description: "Product bundle/kit" },
  { type: "out_of_stock", label: "Out of Stock", description: "Currently unavailable" },
]

interface TagState {
  tag: ProductTagType
  priority: number
  discount_percent: number | null
}

interface ProductFormProps {
  product: {
    id: string
    slug: string
    name: string
    description: string | null
    price_cents: number
    stripe_price_id: string | null
    specs: unknown
    is_featured: boolean | null
    // Discount fields (Phase 14.3)
    discount_percent: number | null
    discount_expires_at: string | null
    original_price_cents: number | null
  }
  initialTags?: TagState[]
}

export function ProductForm({ product, initialTags = [] }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [description, setDescription] = useState(product.description || "")
  const [priceCents, setPriceCents] = useState(product.price_cents)
  const [stripePriceId, setStripePriceId] = useState(product.stripe_price_id || "")
  const [isFeatured, setIsFeatured] = useState(product.is_featured || false)

  // Discount state (Phase 14.3)
  const [discountPercent, setDiscountPercent] = useState<number | null>(product.discount_percent)
  const [discountExpiresAt, setDiscountExpiresAt] = useState(product.discount_expires_at || "")
  const [originalPriceCents, setOriginalPriceCents] = useState<number | null>(product.original_price_cents)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)) {
      return Object.entries(product.specs as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: String(value ?? ""),
      }))
    }
    return []
  })

  // Tags state
  const [selectedTags, setSelectedTags] = useState<TagState[]>(initialTags)

  const toggleTag = (tagType: ProductTagType) => {
    setSelectedTags((prev) => {
      const exists = prev.find((t) => t.tag === tagType)
      if (exists) {
        return prev.filter((t) => t.tag !== tagType)
      }
      return [...prev, { tag: tagType, priority: 0, discount_percent: null }]
    })
  }

  const updateTagPriority = (tagType: ProductTagType, priority: number) => {
    setSelectedTags((prev) =>
      prev.map((t) => (t.tag === tagType ? { ...t, priority } : t))
    )
  }

  const updateDiscountPercent = (percent: number | null) => {
    setSelectedTags((prev) =>
      prev.map((t) => (t.tag === "discount" ? { ...t, discount_percent: percent } : t))
    )
  }

  const isTagSelected = (tagType: ProductTagType) =>
    selectedTags.some((t) => t.tag === tagType)

  const getTagPriority = (tagType: ProductTagType) =>
    selectedTags.find((t) => t.tag === tagType)?.priority ?? 0

  const getDiscountPercent = () =>
    selectedTags.find((t) => t.tag === "discount")?.discount_percent ?? null

  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }])
  }

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Convert specs array to object
    const specsObject: Record<string, string> = {}
    specs.forEach((spec) => {
      if (spec.key.trim()) {
        specsObject[spec.key.trim()] = spec.value.trim()
      }
    })

    startTransition(async () => {
      // Update product
      const result = await updateProduct(product.id, {
        name,
        slug,
        description: description || null,
        price_cents: priceCents,
        stripe_price_id: stripePriceId || null,
        specs: Object.keys(specsObject).length > 0 ? specsObject : null,
        is_featured: isFeatured,
        // Discount fields (Phase 14.3)
        discount_percent: discountPercent,
        discount_expires_at: discountExpiresAt || null,
        original_price_cents: originalPriceCents,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      // Update tags
      const tagsResult = await updateProductTags(product.id, selectedTags)
      if (tagsResult.error) {
        setError(tagsResult.error)
        return
      }

      router.push("/admin/products")
      router.refresh()
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    const result = await deleteProduct(product.id)

    if (result.error) {
      setError(result.error)
      setIsDeleting(false)
    } else {
      router.push("/admin/products")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Product name, slug, and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-900">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-slate-900">
                Slug
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-900">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Price and Stripe configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-slate-900">
                Price (cents)
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                value={priceCents}
                onChange={(e) => setPriceCents(parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-slate-500">
                Display price: ${(priceCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="stripe" className="text-sm font-medium text-slate-900">
                Stripe Price ID
              </label>
              <Input
                id="stripe"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                placeholder="price_..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-700"
            />
            <label htmlFor="featured" className="text-sm text-slate-900">
              Featured product (shown on homepage)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Discount */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Settings</CardTitle>
          <CardDescription>Configure time-limited discounts for this product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="discountPercent" className="text-sm font-medium text-slate-900">
                Discount %
              </label>
              <Input
                id="discountPercent"
                type="number"
                min="1"
                max="99"
                value={discountPercent ?? ""}
                onChange={(e) => setDiscountPercent(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="originalPrice" className="text-sm font-medium text-slate-900">
                Original Price (cents)
              </label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                value={originalPriceCents ?? ""}
                onChange={(e) => setOriginalPriceCents(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 9999"
              />
              {originalPriceCents && (
                <p className="text-xs text-slate-500">
                  Display: ${(originalPriceCents / 100).toFixed(2)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="discountExpires" className="text-sm font-medium text-slate-900">
                Expires At
              </label>
              <Input
                id="discountExpires"
                type="datetime-local"
                value={discountExpiresAt ? discountExpiresAt.slice(0, 16) : ""}
                onChange={(e) => setDiscountExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : "")}
              />
            </div>
          </div>
          {discountPercent && originalPriceCents && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700">
                <span className="font-mono font-semibold">{discountPercent}%</span> discount:
                <span className="line-through text-slate-500 mx-2">${(originalPriceCents / 100).toFixed(2)}</span>
                → <span className="font-mono font-semibold">${(priceCents / 100).toFixed(2)}</span>
                <span className="text-green-600 ml-2">(saves ${((originalPriceCents - priceCents) / 100).toFixed(2)})</span>
              </p>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Set all three fields to enable a discount. Current price should be the discounted price.
            {!discountExpiresAt && discountPercent && " Leave 'Expires At' empty for no expiration."}
          </p>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Product Tags</CardTitle>
          <CardDescription>Select tags to display on the product card (max 3 shown)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {ALL_TAGS.map((tagInfo) => (
              <div
                key={tagInfo.type}
                className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                  isTagSelected(tagInfo.type)
                    ? "border-cyan-700 bg-cyan-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  id={`tag-${tagInfo.type}`}
                  checked={isTagSelected(tagInfo.type)}
                  onChange={() => toggleTag(tagInfo.type)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-700"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`tag-${tagInfo.type}`}
                    className="block text-sm font-medium text-slate-900 cursor-pointer"
                  >
                    {tagInfo.label}
                  </label>
                  <p className="text-xs text-slate-500">{tagInfo.description}</p>

                  {/* Show priority input when selected */}
                  {isTagSelected(tagInfo.type) && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-600">Priority:</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={getTagPriority(tagInfo.type)}
                        onChange={(e) =>
                          updateTagPriority(tagInfo.type, parseInt(e.target.value) || 0)
                        }
                        className="w-20 h-7 text-xs"
                      />
                    </div>
                  )}

                  {/* Show discount percentage when discount tag is selected */}
                  {tagInfo.type === "discount" && isTagSelected("discount") && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-600">Discount %:</label>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={getDiscountPercent() ?? ""}
                        onChange={(e) =>
                          updateDiscountPercent(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="e.g., 20"
                        className="w-20 h-7 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Higher priority tags are shown first. Tags are sorted by priority when displayed.
          </p>
        </CardContent>
      </Card>

      {/* Specs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>Technical specifications (key-value pairs)</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>
              <Plus className="mr-2 h-4 w-4" />
              Add Spec
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specs.length === 0 ? (
            <p className="text-sm text-slate-500">No specifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSpec(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete Product
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-cyan-700 hover:bg-cyan-600"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  )
}
