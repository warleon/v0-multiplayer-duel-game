"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AcceptDuelButtonProps {
  duelId: string
  betAmount: number
}

export function AcceptDuelButton({ duelId, betAmount }: AcceptDuelButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update the duel to accepted status and set opponent
      const { error: updateError } = await supabase
        .from("duels")
        .update({
          opponent_id: user.id,
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", duelId)
        .eq("status", "open") // Ensure it's still open

      if (updateError) throw updateError

      // Create notification for the duel creator
      const { data: duel } = await supabase.from("duels").select("creator_id").eq("id", duelId).single()

      if (duel) {
        await supabase.from("notifications").insert({
          user_id: duel.creator_id,
          type: "duel_accepted",
          title: "Duel Accepted!",
          message: "Your duel challenge has been accepted. Prepare for battle!",
          data: { duel_id: duelId },
        })
      }

      setIsOpen(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const potentialWinnings = Math.floor(betAmount * 0.8)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Accept Challenge</Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white">Accept Duel Challenge</DialogTitle>
          <DialogDescription className="text-purple-200">
            Are you ready to enter battle? Review the terms below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/10">
            <h4 className="text-white font-semibold mb-2">Battle Terms</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-200">Your bet:</span>
                <span className="text-white font-bold">{betAmount} coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Potential winnings:</span>
                <span className="text-green-400 font-bold">{potentialWinnings} coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">If you lose:</span>
                <span className="text-red-400 font-bold">-{betAmount} coins</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-200 text-sm">
              <strong>Warning:</strong> By accepting this duel, you agree to risk {betAmount} coins. The battle will be
              turn-based combat until one warrior is defeated.
            </p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/30">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
            {isLoading ? "Accepting..." : "Accept & Enter Battle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
