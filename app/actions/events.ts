"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if studio profile exists, if not create one
  const { data: studio } = await supabase.from("studios").select("id").eq("id", user.id).single()

  if (!studio) {
    // Auto-create studio profile for new users
    await supabase.from("studios").insert({
      id: user.id,
      name: "My Studio", // Default name, should be editable in settings
      location: "TBD",
      wallet_address: "bitcoincash:...", // Placeholder
    })
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const date = formData.get("date") as string
  const location = formData.get("location") as string
  const price_bch = Number.parseFloat(formData.get("price_bch") as string) || 0
  const price_fiat = Number.parseFloat(formData.get("price_fiat") as string) || 0
  const max_spots = Number.parseInt(formData.get("max_spots") as string) || 0
  const image_url = formData.get("image_url") as string

  const { error } = await supabase.from("events").insert({
    studio_id: user.id,
    title,
    description,
    date,
    location,
    price_bch,
    price_fiat,
    max_spots,
    image_url: image_url || null,
  })

  if (error) {
    console.error("Error creating event:", error)
    return // Handle error appropriately
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
