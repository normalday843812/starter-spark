"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Package, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClaimResponse {
  error?: string
  success?: boolean
}

interface PendingLicenseCardProps {
  licenseId: string
  code: string
  productName: string
  productDescription: string | null
  purchasedAt: string
}

export function PendingLicenseCard({
  licenseId,
  code,
  productName,
  productDescription,
  purchasedAt,
}: PendingLicenseCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<"claim" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mask the code for display (show first and last 4 chars)
  const maskedCode = code.length > 8
    ? `${code.slice(0, 4)}-****-****-${code.slice(-4)}`
    : code

  const handleClaim = () => {
    setIsLoading("claim")
    setError(null)

    fetch("/api/workshop/claim-pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseId, action: "claim" }),
    })
      .then((res) => res.json() as Promise<ClaimResponse>)
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          router.refresh()
        }
      })
      .catch(() => {
        setError("Network error. Please try again.")
      })
      .finally(() => {
        setIsLoading(null)
      })
  }

  const handleReject = () => {
    setIsLoading("reject")
    setError(null)

    fetch("/api/workshop/claim-pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseId, action: "reject" }),
    })
      .then((res) => res.json() as Promise<ClaimResponse>)
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          router.refresh()
        }
      })
      .catch(() => {
        setError("Network error. Please try again.")
      })
      .finally(() => {
        setIsLoading(null)
      })
  }

  const purchaseDate = new Date(purchasedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-amber-700" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-mono font-semibold text-slate-900">
                {productName}
              </h4>
              {productDescription && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                  {productDescription}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-mono">{maskedCode}</span>
                <span>Purchased {purchaseDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isLoading !== null}
                className="border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                {isLoading === "reject" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={isLoading !== null}
                className="bg-cyan-700 hover:bg-cyan-600 text-white"
              >
                {isLoading === "claim" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Claim
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
