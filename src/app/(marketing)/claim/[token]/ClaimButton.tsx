"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClaimButtonProps {
  token: string
}

export function ClaimButton({ token }: ClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleClaim = async () => {
    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/claim-by-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Kit claimed successfully!")
        // Redirect to workshop after a brief delay
        setTimeout(() => {
          router.push("/workshop?claimed=true")
        }, 1500)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to claim kit. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-mono">{message}</span>
        </div>
        <p className="text-sm text-slate-500">Redirecting to Workshop...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleClaim}
        disabled={isLoading}
        className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-mono"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Claiming...
          </>
        ) : (
          "Claim Kit"
        )}
      </Button>

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {message}
        </div>
      )}
    </div>
  )
}
