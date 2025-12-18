"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Eye, Mail, CheckCircle, Clock, XCircle } from "lucide-react"

interface Submission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string | null
  created_at: string | null
}

interface SupportActionsProps {
  submission: Submission
}

export function SupportActions({ submission }: SupportActionsProps) {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status: newStatus })
        .eq("id", submission.id)

      if (error) throw error
      router.refresh()
    } catch {
      console.error("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  const subjectLabels: Record<string, string> = {
    general: "General Inquiry",
    order: "Order Help",
    technical: "Technical Support",
    educator: "Educator Program",
    feedback: "Feedback",
    other: "Other",
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
              <Mail className="mr-2 h-4 w-4" />
              Reply via Email
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => updateStatus("pending")}
            disabled={(submission.status || "pending") === "pending"}
          >
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            Mark Pending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatus("in_progress")}
            disabled={(submission.status || "pending") === "in_progress"}
          >
            <Clock className="mr-2 h-4 w-4 text-cyan-500" />
            Mark In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatus("resolved")}
            disabled={(submission.status || "pending") === "resolved"}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Mark Resolved
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateStatus("closed")}
            disabled={(submission.status || "pending") === "closed"}
          >
            <XCircle className="mr-2 h-4 w-4 text-slate-500" />
            Close
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
            <DialogDescription>
              {subjectLabels[submission.subject] || submission.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">From</p>
                <p className="text-slate-900">{submission.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <a
                  href={`mailto:${submission.email}`}
                  className="text-cyan-700 hover:underline"
                >
                  {submission.email}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Received</p>
              <p className="text-slate-900">
                {submission.created_at
                  ? new Date(submission.created_at).toLocaleString()
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Message</p>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-slate-700 whitespace-pre-wrap">{submission.message}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button asChild>
                <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Reply via Email
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
