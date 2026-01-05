import Link from 'next/link'
import { ExternalLink, ChevronLeft, Zap } from 'lucide-react'
import { VercelDrainsOverview } from './VercelDrainsOverview'

export const metadata = {
  title: 'Performance Analytics | Admin',
}

// Get app URL from environment or Vercel system env
function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export default function PerformanceAnalyticsPage() {
  const appUrl = getAppUrl()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-cyan-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Analytics
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-slate-900">
              Performance Analytics
            </h1>
            <p className="text-slate-600">
              Real user performance and observability via Vercel Drains
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href="https://vercel.com/docs/drains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              <Zap className="h-4 w-4" />
              Drains docs
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Open site
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <VercelDrainsOverview />
    </div>
  )
}
