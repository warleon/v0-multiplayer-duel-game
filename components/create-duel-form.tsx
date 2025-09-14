"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface CreateDuelFormProps {
  maxCoins: number
}

export function CreateDuelForm({ maxCoins }: CreateDuelFormProps) {
  const [betAmount, setBetAmount] = useState([Math.min(100, maxCoins)])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if user has enough coins
      if (betAmount[0] > maxCoins) {
        throw new Error("Insufficient coins")
      }

      // Create the duel
      const { error: duelError } = await supabase.from("duels").insert({
        creator_id: user.id,
        bet_amount: betAmount[0],
        status: "open",
      })

      if (duelError) throw duelError

      router.push("/duels")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const potentialWinnings = Math.floor(betAmount[0] * 0.8)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-purple-100">Bet Amount: {betAmount[0]} coins</Label>
          <Slider value={betAmount} onValueChange={setBetAmount} max={maxCoins} min={10} step={10} className="w-full" />
          <div className="flex justify-between text-sm text-purple-300">
            <span>Min: 10</span>
            <span>Max: {maxCoins}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="betInput" className="text-purple-100">
            Or enter exact amount
          </Label>
          <Input
            id="betInput"
            type="number"
            min={10}
            max={maxCoins}
            value={betAmount[0]}
            onChange={(e) => {
              const value = Math.max(10, Math.min(maxCoins, Number.parseInt(e.target.value) || 10))
              setBetAmount([value])
            }}
            className="bg-slate-700/50 border-purple-500/30 text-white"
          />
        </div>

        <div className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/10">
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Potential winnings:</span>
            <span className="text-green-400 font-bold">{potentialWinnings} coins</span>
          </div>
          <p className="text-purple-300 text-sm mt-1">You'll win 80% of your opponent's bet if victorious</p>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/30">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading || betAmount[0] > maxCoins}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
      >
        {isLoading ? "Creating Duel..." : `Create Duel (${betAmount[0]} coins)`}
      </Button>
    </form>
  )
}
