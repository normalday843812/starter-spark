export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-cyan-700 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-mono">Loading...</p>
      </div>
    </div>
  )
}
