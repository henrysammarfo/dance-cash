import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users } from "lucide-react"
import { EventCard } from "@/components/event-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch studio events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("studio_id", user?.id)
    .order("date", { ascending: true })

  // Calculate stats (mock for now, would be real aggregations)
  const totalEvents = events?.length || 0
  const totalRevenue = 0 // Placeholder
  const totalSignups = 0 // Placeholder

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your studio overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignups}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {!events?.length && (
            <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              No events created yet. Start by creating your first event!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
