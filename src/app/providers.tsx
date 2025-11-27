'use client'

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Future: Add providers here
  // - PostHog analytics
  // - Cart store provider (if not using Zustand with persist)
  // - Theme provider (if adding dark mode support later)
  return <>{children}</>
}
