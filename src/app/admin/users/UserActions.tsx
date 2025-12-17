"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, UserCog, User, Loader2 } from "lucide-react"
import { updateUserRole } from "./actions"

interface UserActionsProps {
  userId: string
  currentRole: string | null
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = async (newRole: "admin" | "staff" | "user") => {
    if (newRole === currentRole) return

    const confirmMessage =
      newRole === "admin"
        ? "Are you sure you want to make this user an admin? They will have full access to all admin features."
        : newRole === "staff"
          ? "Are you sure you want to make this user a staff member?"
          : "Are you sure you want to demote this user to a regular user?"

    if (!confirm(confirmMessage)) {
      return
    }

    setIsLoading(true)
    const result = await updateUserRole(userId, newRole)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => void handleRoleChange("admin")}
          disabled={currentRole === "admin"}
        >
          <Shield className="mr-2 h-4 w-4 text-purple-600" />
          Make Admin
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void handleRoleChange("staff")}
          disabled={currentRole === "staff"}
        >
          <UserCog className="mr-2 h-4 w-4 text-cyan-600" />
          Make Staff
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleRoleChange("user")}
          disabled={currentRole === "user"}
        >
          <User className="mr-2 h-4 w-4" />
          Make Regular User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
