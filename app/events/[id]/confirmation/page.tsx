import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { signupId: string }
}) {
  const supabase = await createClient()

  const { data: signup } = await supabase
    .from("signups")
    .select("*, events(*, studios(name))")
    .eq("id", searchParams.signupId)
    .single()

  if (!signup) {
    notFound()
  }

  const event = signup.events
  const ticketQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${signup.ticket_code}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">You're Going!</h1>
          <p className="text-muted-foreground">Your ticket has been confirmed.</p>
        </div>

        {/* NFT Ticket Card */}
        <div className="relative group perspective-1000">
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-primary/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.15)]">
            {/* Holographic Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.05)_25%,transparent_30%)] pointer-events-none" />

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-primary">DANCE CASH NFT</h3>
                  <p className="text-xs text-muted-foreground">Immutable Ticket Asset</p>
                </div>
                <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
                  #{signup.ticket_code.substring(0, 6)}
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold leading-tight">{event.title}</h2>
                <p className="text-sm text-muted-foreground">{event.studios.name}</p>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">DATE</p>
                  <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground">TIME</p>
                  <p className="font-medium">
                    {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-center">
                <div className="bg-white p-2 rounded-lg">
                  <Image
                    src={ticketQrUrl || "/placeholder.svg"}
                    alt="Ticket QR"
                    width={150}
                    height={150}
                    className="mix-blend-multiply"
                  />
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground font-mono">{signup.ticket_code}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
          <Button className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4" />
            Save Ticket
          </Button>
        </div>
      </div>
    </div>
  )
}
