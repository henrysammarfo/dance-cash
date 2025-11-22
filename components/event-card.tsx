import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string
    location: string
    price_bch: number | null
    price_fiat: number | null
    image_url: string | null
    max_spots: number | null
  }
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 transition-all duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={event.image_url || `/placeholder.svg?height=400&width=600&query=dance`}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/70 backdrop-blur-md text-primary border-primary/30">
            {event.price_bch ? `${event.price_bch} BCH` : `$${event.price_fiat}`}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        {event.max_spots && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{event.max_spots} spots total</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
