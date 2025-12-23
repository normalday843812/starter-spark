import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Claim a Kit",
  description: "Use the claim link from your email to activate your kit license.",
}

export default function ClaimPage() {
  return (
    <div className="min-h-[60vh] bg-white px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-mono text-cyan-700 mb-3">Claim a Kit</p>
        <h1 className="font-mono text-3xl lg:text-4xl text-slate-900 mb-4">
          Use your claim link
        </h1>
        <p className="text-slate-600 leading-relaxed mb-8">
          Claim links are unique to your purchase. Please open the link from your
          email to activate your kit license. If you need help, we&apos;re here for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/workshop"
            className="inline-flex items-center justify-center rounded bg-cyan-700 px-4 py-2 text-white font-mono text-sm hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
          >
            Go to Workshop
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded border border-slate-200 px-4 py-2 text-slate-700 font-mono text-sm hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
