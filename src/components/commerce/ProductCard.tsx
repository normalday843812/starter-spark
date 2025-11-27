"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"
import Link from "next/link"

interface ProductCardProps {
  slug: string
  name: string
  price: number
  image?: string
  inStock: boolean
  badge?: string
}

export function ProductCard({
  slug,
  name,
  price,
  image,
  inStock,
  badge,
}: ProductCardProps) {
  return (
    <Link href={`/shop/${slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="h-full bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all cursor-pointer">
          <CardContent className="p-0">
            {/* Image Area */}
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
              {/* Placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-3 rounded-full bg-slate-200 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 font-mono text-xs">Product Image</p>
              </div>

              {/* Badge */}
              {badge && (
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-cyan-700 text-white font-mono text-xs"
                  >
                    {badge}
                  </Badge>
                </div>
              )}

              {/* Stock Badge */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant="outline"
                  className={`font-mono text-xs ${
                    inStock
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {inStock ? "In Stock" : "Pre-Order"}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-mono text-lg text-slate-900 mb-2 line-clamp-2">
                {name}
              </h3>
              <p className="text-2xl font-mono text-amber-600">${price}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
