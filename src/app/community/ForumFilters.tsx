"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"

interface Product {
  id: string
  name: string
  slug: string
}

interface ForumFiltersProps {
  products: Product[]
  availableTags: string[]
  currentStatus?: string
  currentTag?: string
  currentProduct?: string
}

export function ForumFilters({
  products,
  availableTags,
  currentStatus,
  currentTag,
  currentProduct,
}: ForumFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/community?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    router.push("/community")
  }

  const hasActiveFilters =
    currentStatus || currentTag || currentProduct

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-mono text-slate-600 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                updateFilter("q", search.trim())
              }
            }}
            className="pl-10 bg-white border-slate-200 focus:border-cyan-700"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-mono text-slate-600 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {["all", "open", "solved"].map((status) => (
            <Button
              key={status}
              variant={
                (currentStatus || "all") === status ? "default" : "outline"
              }
              size="sm"
              onClick={() => updateFilter("status", status)}
              className={
                (currentStatus || "all") === status
                  ? "bg-cyan-700 hover:bg-cyan-600 text-white font-mono"
                  : "border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono"
              }
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-mono text-slate-600 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 10).map((tag) => (
              <Button
                key={tag}
                variant={currentTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateFilter("tag", currentTag === tag ? null : tag)
                }
                className={
                  currentTag === tag
                    ? "bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs"
                    : "border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono text-xs"
                }
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Product Filter */}
      {products.length > 0 && (
        <div>
          <label className="block text-sm font-mono text-slate-600 mb-2">
            Product
          </label>
          <select
            value={currentProduct || ""}
            onChange={(e) => updateFilter("product", e.target.value || null)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:border-cyan-700 focus:outline-none"
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-slate-500 hover:text-cyan-700"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
