"use client"

import { Package, UserX } from "lucide-react"

interface ClaimedByOtherCardProps {
  code: string
  productName: string
  purchasedAt: string
}

export function ClaimedByOtherCard({
  code,
  productName,
  purchasedAt,
}: ClaimedByOtherCardProps) {
  // Mask the code for display (show first and last 4 chars)
  const maskedCode = code.length > 8
    ? `${code.slice(0, 4)}-****-****-${code.slice(-4)}`
    : code

  const purchaseDate = new Date(purchasedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 opacity-75">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-slate-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-mono font-semibold text-slate-600 line-through">
                {productName}
              </h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-mono">{maskedCode}</span>
                <span>Purchased {purchaseDate}</span>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-200 text-slate-600 text-xs font-mono">
              <UserX className="w-3.5 h-3.5" />
              <span>Claimed by another</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
