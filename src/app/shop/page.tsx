"use client"

import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/commerce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { useState, useMemo } from "react"

// Mock products - will be replaced with Supabase fetch
// Order: Bestseller first, Pre-Order/Out of Stock last
const products = [
  {
    slug: "4dof-arm",
    name: "4DOF Robotic Arm Kit",
    price: 49,
    inStock: true,
    badge: "Bestseller",
    category: "kit",
  },
  {
    slug: "starter-bundle",
    name: "Starter Bundle",
    price: 69,
    inStock: true,
    category: "bundle",
  },
  {
    slug: "classroom-pack",
    name: "Classroom Pack (5 Kits)",
    price: 199,
    inStock: true,
    badge: "Bulk Discount",
    category: "bundle",
  },
  {
    slug: "spare-servo-pack",
    name: "Spare Servo Pack",
    price: 15,
    inStock: false,
    badge: "Pre-Order",
    category: "parts",
  },
]

type FilterOption = "all" | "kit" | "bundle" | "parts"

export default function ShopPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterOption>("all")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesFilter = filter === "all" || product.category === filter
      return matchesSearch && matchesFilter
    })
  }, [search, filter])

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="pt-32 pb-8 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-mono text-cyan-700 mb-2">Shop</p>
          <h1 className="font-mono text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Robotics Kits
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Everything you need to start building. Each kit includes components,
            tools, and full access to our learning platform.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-8 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-cyan-700"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {(["all", "kit", "bundle", "parts"] as FilterOption[]).map(
                (option) => (
                  <Button
                    key={option}
                    variant={filter === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(option)}
                    className={
                      filter === option
                        ? "bg-cyan-700 hover:bg-cyan-600 text-white font-mono"
                        : "border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono"
                    }
                  >
                    {option === "all"
                      ? "All"
                      : option.charAt(0).toUpperCase() + option.slice(1) + "s"}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  inStock={product.inStock}
                  badge={product.badge}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 font-mono">
                No products match your search.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("")
                  setFilter("all")
                }}
                className="mt-4 text-cyan-700 hover:text-cyan-600"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Educator CTA */}
          <div className="mt-16 p-8 bg-white rounded border border-slate-200 text-center">
            <h2 className="font-mono text-2xl text-slate-900 mb-3">
              Educator or School?
            </h2>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              We offer special pricing and curriculum support for classrooms.
              Contact us to learn about our education program.
            </p>
            <a
              href="mailto:education@starterspark.com"
              className="inline-block px-6 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-mono rounded transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
