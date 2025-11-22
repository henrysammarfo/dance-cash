import { createEvent } from "@/app/actions/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" placeholder="e.g. Hip Hop Workshop" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe your event..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input id="date" name="date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Studio Address" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_bch">Price (BCH)</Label>
                <Input id="price_bch" name="price_bch" type="number" step="0.001" placeholder="0.05" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_fiat">Price (USD)</Label>
                <Input id="price_fiat" name="price_fiat" type="number" step="0.01" placeholder="25.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_spots">Max Spots</Label>
                <Input id="max_spots" name="max_spots" type="number" placeholder="30" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" name="image_url" placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
