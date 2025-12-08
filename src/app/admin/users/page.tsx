import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Shield, UserCog } from "lucide-react"
import { UserActions } from "./UserActions"

export const metadata = {
  title: "Users | Admin",
}

interface SearchParams {
  role?: string
}

type UserRole = "admin" | "staff" | "user"

async function getUsers(role?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (role && role !== "all" && ["admin", "staff", "user"].includes(role)) {
    query = query.eq("role", role as UserRole)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data
}

async function getUserStats() {
  const supabase = await createClient()

  const [totalResult, adminResult, staffResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "staff"),
  ])

  return {
    total: totalResult.count || 0,
    admins: adminResult.count || 0,
    staff: staffResult.count || 0,
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [users, stats] = await Promise.all([getUsers(params.role), getUserStats()])

  const filters = [
    { label: "All", value: "all" },
    { label: "Users", value: "user" },
    { label: "Staff", value: "staff" },
    { label: "Admins", value: "admin" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600">Manage user accounts and roles</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Users</p>
          <p className="font-mono text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Staff Members</p>
          <p className="font-mono text-2xl font-bold text-cyan-700">{stats.staff}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Administrators</p>
          <p className="font-mono text-2xl font-bold text-purple-700">{stats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === "all"
                ? "/admin/users"
                : `/admin/users?role=${filter.value}`
            }
          >
            <Button
              variant={
                params.role === filter.value || (!params.role && filter.value === "all")
                  ? "default"
                  : "outline"
              }
              size="sm"
              className={
                params.role === filter.value || (!params.role && filter.value === "all")
                  ? "bg-cyan-700 hover:bg-cyan-600"
                  : ""
              }
            >
              {filter.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">No users found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        {user.avatar_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || ""}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-600">
                            {(user.full_name || user.email || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">
                        {user.full_name || "No name"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "border-purple-300 text-purple-700"
                          : user.role === "staff"
                            ? "border-cyan-300 text-cyan-700"
                            : "border-slate-300 text-slate-700"
                      }
                    >
                      {user.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                      {user.role === "staff" && <UserCog className="mr-1 h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <UserActions userId={user.id} currentRole={user.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
