import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { processCheckout } from "@/app/actions/checkout"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { method?: string }
}) {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from("events")
    .select("*, studios(name, wallet_address)")
    .eq("id", params.id)
    .single()

  if (!event) {
    notFound()
  }

  const method = searchParams.method === "bch" ? "bch" : "fiat"
  const price = method === "bch" ? event.price_bch : event.price_fiat
  const currency = method === "bch" ? "BCH" : "USD"

  // Generate BCH QR Code URL if needed
  const bchAddress = event.studios?.wallet_address || "bitcoincash:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqfnhks603"
  const bchQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bchAddress}?amount=${price}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/events/${params.id}`} className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm text-muted-foreground">Back to Event</span>
          </div>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Complete your registration for {event.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border/50">
            <div>
              <p className="font-medium">Total Amount</p>
              <p className="text-sm text-muted-foreground">{method === "bch" ? "Bitcoin Cash" : "Credit Card"}</p>
            </div>
            <div className="text-2xl font-bold text-primary">{method === "bch" ? `${price} BCH` : `$${price}`}</div>
          </div>

          {method === "bch" ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-xl">
                <Image
                  src={bchQrUrl || "/placeholder.svg"}
                  alt="BCH Payment QR"
                  width={200}
                  height={200}
                  className="mix-blend-multiply"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground break-all px-4">
                Send exactly <span className="text-primary font-bold">{price} BCH</span> to:
                <br />
                {bchAddress}
              </p>
              <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs text-center">
                Waiting for transaction... (Simulated)
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Card Information</Label>
                <div className="flex gap-2">
                  <Input placeholder="0000 0000 0000 0000" />
                  <Input placeholder="MM/YY" className="w-24" />
                  <Input placeholder="CVC" className="w-20" />
                </div>
              </div>
            </div>
          )}

          <form action={processCheckout} className="space-y-4">
            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="amount" value={price} />
            <input type="hidden" name="currency" value={currency} />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
              {method === "bch" ? "I Have Sent Payment" : "Pay Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
