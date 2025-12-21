"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

type LessonPrefetchProps = {
  hrefs: string[]
}

export function LessonPrefetch({ hrefs }: LessonPrefetchProps) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (hrefs.length === 0) return

    const connection = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection
    if (connection?.saveData) return
    if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return

    const run = () => {
      for (const href of hrefs) {
        if (href) router.prefetch(href)
      }
    }

    const requestIdleCallback = (
      window as unknown as {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      }
    ).requestIdleCallback
    const cancelIdleCallback = (
      window as unknown as { cancelIdleCallback?: (handle: number) => void }
    ).cancelIdleCallback

    if (typeof requestIdleCallback === "function" && typeof cancelIdleCallback === "function") {
      const handle = requestIdleCallback((_deadline) => {
        void _deadline
        run()
      }, { timeout: 1500 })
      return () => cancelIdleCallback(handle)
    }

    const timeout = window.setTimeout(run, 800)
    return () => window.clearTimeout(timeout)
  }, [router, hrefs])

  return null
}
