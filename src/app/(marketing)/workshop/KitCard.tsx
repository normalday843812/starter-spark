import { Package, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface KitCardProps {
  name: string
  slug: string
  description: string
  claimedAt: string | null
}

export function KitCard({ name, slug, description, claimedAt }: KitCardProps) {
  const formattedDate = claimedAt
    ? new Date(claimedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown"

  return (
    <div className="flex items-start gap-4 p-4 rounded border border-slate-200 hover:border-cyan-700 transition-colors bg-white">
      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Package className="w-6 h-6 text-cyan-700" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-mono text-lg text-slate-900 mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-slate-600 mb-2 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Claimed {formattedDate}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        {slug && (
          <Link href={`/learn/${slug}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Learn
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
