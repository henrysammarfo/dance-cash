"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function processCheckout(formData: FormData) {
  const supabase = await createClient()

  const eventId = formData.get("eventId") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const currency = formData.get("currency") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create Signup
  const { data: signup, error: signupError } = await supabase
    .from("signups")
    .insert({
      event_id: eventId,
      user_id: user?.id || null,
      name,
      email,
      status: "confirmed", // Auto-confirm for demo
    })
    .select()
    .single()

  if (signupError) {
    console.error("Signup error:", signupError)
    return redirect(`/events/${eventId}?error=signup_failed`)
  }

  // Create Payment Record
  const { error: paymentError } = await supabase.from("payments").insert({
    signup_id: signup.id,
    amount,
    currency,
    status: "completed", // Auto-complete for demo
    tx_hash: currency === "BCH" ? "simulated_tx_hash_" + Date.now() : null,
  })

  if (paymentError) {
    console.error("Payment error:", paymentError)
    // In real app, might need to rollback signup or mark as pending
  }

  redirect(`/events/${eventId}/confirmation?signupId=${signup.id}`)
}
