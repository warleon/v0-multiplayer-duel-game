"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()

    await supabase.auth.signOut()
    router.push("/")
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
    >
      {isLoading ? "Leaving..." : "Leave Arena"}
    </Button>
  )
}
