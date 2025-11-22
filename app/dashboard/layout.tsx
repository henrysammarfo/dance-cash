import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Calendar, Settings, LogOut, Plus } from "lucide-react"
import { signOut } from "@/app/actions/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-card/30 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Studio Panel
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/events">
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary">
              <Calendar className="w-4 h-4" />
              My Events
            </Button>
          </Link>
          <Link href="/dashboard/events/new">
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </nav>

        <form action={signOut}>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
