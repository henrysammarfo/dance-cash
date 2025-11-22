import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Dance Cash
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/studios" className="text-sm font-medium hover:text-primary transition-colors">
            Studios
          </Link>
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Studio Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
