import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access your kits and learning materials.",
}

export default function AuthLandingPage() {
  return (
    <div className="min-h-[60vh] bg-white px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-mono text-cyan-700 mb-3">Account Access</p>
        <h1 className="font-mono text-3xl lg:text-4xl text-slate-900 mb-4">
          Sign in to continue
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          Please use the sign-in page to access your kits, workshops, and
          learning materials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded bg-cyan-700 px-4 py-2 text-white font-mono text-sm hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  )
}
