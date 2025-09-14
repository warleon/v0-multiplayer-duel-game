"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BattleMove {
  id: string
  name: string
  damage: number
  accuracy: number
  description: string
}

const BATTLE_MOVES: BattleMove[] = [
  { id: "strike", name: "Strike", damage: 25, accuracy: 90, description: "A reliable physical attack" },
  { id: "power_attack", name: "Power Attack", damage: 40, accuracy: 70, description: "High damage but less accurate" },
  { id: "quick_strike", name: "Quick Strike", damage: 15, accuracy: 95, description: "Fast and accurate but weak" },
  { id: "critical_hit", name: "Critical Hit", damage: 35, accuracy: 75, description: "Aims for weak points" },
]

interface BattleArenaProps {
  duel: any
  battleState: any
  currentUserId: string
}

export function BattleArena({ duel, battleState: initialBattleState, currentUserId }: BattleArenaProps) {
  const [battleState, setBattleState] = useState(initialBattleState)
  const [isLoading, setIsLoading] = useState(false)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const router = useRouter()

  const isPlayer1 = currentUserId === battleState.player1_id
  const isMyTurn = currentUserId === battleState.current_turn
  const opponent = isPlayer1 ? duel.opponent : duel.creator
  const myHp = isPlayer1 ? battleState.player1_hp : battleState.player2_hp
  const opponentHp = isPlayer1 ? battleState.player2_hp : battleState.player1_hp

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to battle state changes
    const channel = supabase
      .channel(`battle:${battleState.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "battle_states",
          filter: `id=eq.${battleState.id}`,
        },
        (payload) => {
          const updatedBattleState = payload.new
          setBattleState(updatedBattleState)

          // Update battle log
          if (updatedBattleState.battle_log && Array.isArray(updatedBattleState.battle_log)) {
            setBattleLog(updatedBattleState.battle_log)
          }

          // Check if battle is finished
          if (updatedBattleState.status === "finished") {
            setTimeout(() => {
              router.push("/dashboard")
            }, 3000)
          }
        },
      )
      .subscribe()

    // Initialize battle log
    if (battleState.battle_log && Array.isArray(battleState.battle_log)) {
      setBattleLog(battleState.battle_log)
    }

    return () => {
      channel.unsubscribe()
    }
  }, [battleState.id, router])

  const executeMove = async (move: BattleMove) => {
    if (!isMyTurn || isLoading) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Calculate if move hits
      const hitRoll = Math.random() * 100
      const hits = hitRoll <= move.accuracy
      const damage = hits ? move.damage + Math.floor(Math.random() * 10) - 5 : 0 // Add some randomness

      // Calculate new HP values
      const newOpponentHp = Math.max(0, opponentHp - damage)
      const newPlayer1Hp = isPlayer1 ? myHp : newOpponentHp
      const newPlayer2Hp = isPlayer1 ? newOpponentHp : myHp

      // Create battle log entry
      const playerName = isPlayer1 ? duel.creator.display_name : duel.opponent.display_name
      const logEntry = hits
        ? `${playerName} used ${move.name} and dealt ${damage} damage!`
        : `${playerName} used ${move.name} but missed!`

      const newBattleLog = [...battleLog, logEntry]

      // Check if battle is over
      const battleFinished = newOpponentHp <= 0
      const winnerId = battleFinished ? currentUserId : null
      const nextTurn = battleFinished ? null : isPlayer1 ? battleState.player2_id : battleState.player1_id

      // Update battle state
      const { error } = await supabase
        .from("battle_states")
        .update({
          player1_hp: newPlayer1Hp,
          player2_hp: newPlayer2Hp,
          current_turn: nextTurn,
          battle_log: newBattleLog,
          status: battleFinished ? "finished" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", battleState.id)

      if (error) throw error

      // If battle is finished, complete the duel and handle betting
      if (battleFinished && winnerId) {
        // Call the complete_duel function
        await supabase.rpc("complete_duel", {
          duel_id_param: duel.id,
          winner_id_param: winnerId,
        })

        // Create notifications for both players
        const loserName = winnerId === duel.creator_id ? duel.opponent.display_name : duel.creator.display_name
        const winnerName = winnerId === duel.creator_id ? duel.creator.display_name : duel.opponent.display_name

        await supabase.from("notifications").insert([
          {
            user_id: winnerId,
            type: "battle_finished",
            title: "Victory!",
            message: `You defeated ${loserName} and won ${Math.floor(duel.bet_amount * 0.8)} coins!`,
            data: { duel_id: duel.id, result: "won" },
          },
          {
            user_id: winnerId === duel.creator_id ? duel.opponent_id : duel.creator_id,
            type: "battle_finished",
            title: "Defeat",
            message: `You were defeated by ${winnerName} and lost ${duel.bet_amount} coins.`,
            data: { duel_id: duel.id, result: "lost" },
          },
        ])
      } else if (!battleFinished) {
        // Notify opponent it's their turn
        await supabase.from("notifications").insert({
          user_id: nextTurn,
          type: "battle_turn",
          title: "Your Turn!",
          message: `It's your turn in the battle against ${isPlayer1 ? duel.creator.display_name : duel.opponent.display_name}`,
          data: { duel_id: duel.id },
        })
      }
    } catch (error) {
      console.error("Error executing move:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const battleFinished = battleState.status === "finished"
  const winner = battleFinished ? (battleState.player1_hp <= 0 ? duel.opponent : duel.creator) : null

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Battle Arena</h1>
          <p className="text-purple-200">
            {battleFinished
              ? `Battle Complete! ${winner?.display_name} is victorious!`
              : isMyTurn
                ? "Your turn - choose your move!"
                : "Waiting for opponent's move..."}
          </p>
        </div>

        {/* Battle Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 */}
          <Card
            className={`border-purple-500/20 bg-slate-800/50 backdrop-blur-sm ${isPlayer1 ? "ring-2 ring-purple-500" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{duel.creator.display_name}</span>
                {isPlayer1 && <Badge className="bg-purple-500 text-white">You</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Health</span>
                    <span className="text-white">{battleState.player1_hp}/100</span>
                  </div>
                  <Progress value={battleState.player1_hp} className="h-3" />
                </div>
                <div className="text-sm text-purple-300">
                  {duel.creator.wins}W - {duel.creator.losses}L
                </div>
                {battleState.current_turn === duel.creator_id && !battleFinished && (
                  <Badge className="bg-yellow-500 text-yellow-900">Current Turn</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player 2 */}
          <Card
            className={`border-purple-500/20 bg-slate-800/50 backdrop-blur-sm ${!isPlayer1 ? "ring-2 ring-purple-500" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{duel.opponent.display_name}</span>
                {!isPlayer1 && <Badge className="bg-purple-500 text-white">You</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-200">Health</span>
                    <span className="text-white">{battleState.player2_hp}/100</span>
                  </div>
                  <Progress value={battleState.player2_hp} className="h-3" />
                </div>
                <div className="text-sm text-purple-300">
                  {duel.opponent.wins}W - {duel.opponent.losses}L
                </div>
                {battleState.current_turn === duel.opponent_id && !battleFinished && (
                  <Badge className="bg-yellow-500 text-yellow-900">Current Turn</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Battle Actions */}
        {!battleFinished && (
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">{isMyTurn ? "Choose Your Move" : "Waiting for Opponent"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isMyTurn ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BATTLE_MOVES.map((move) => (
                    <Button
                      key={move.id}
                      onClick={() => executeMove(move)}
                      disabled={isLoading}
                      className="h-auto p-4 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-start"
                    >
                      <div className="flex justify-between w-full mb-2">
                        <span className="font-semibold">{move.name}</span>
                        <span className="text-sm opacity-80">{move.damage} DMG</span>
                      </div>
                      <p className="text-sm opacity-80 text-left">{move.description}</p>
                      <p className="text-xs opacity-60 mt-1">{move.accuracy}% accuracy</p>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-purple-200">Waiting for {opponent.display_name} to make their move...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Battle Finished */}
        {battleFinished && (
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Battle Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-2xl font-bold text-white">{winner?.display_name} Wins!</div>
              <div className="text-purple-200">
                {currentUserId === winner?.id ? (
                  <p>Congratulations! You won {Math.floor(duel.bet_amount * 0.8)} coins!</p>
                ) : (
                  <p>You lost {duel.bet_amount} coins. Better luck next time!</p>
                )}
              </div>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Battle Log */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Battle Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {battleLog.length > 0 ? (
                battleLog.map((entry, index) => (
                  <p key={index} className="text-purple-200 text-sm">
                    {entry}
                  </p>
                ))
              ) : (
                <p className="text-purple-300 text-sm">Battle is about to begin...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stakes Info */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Battle Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-purple-200 text-sm">Bet Amount</p>
                <p className="text-white font-bold text-lg">{duel.bet_amount} coins</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Winner Gets</p>
                <p className="text-green-400 font-bold text-lg">{Math.floor(duel.bet_amount * 0.8)} coins</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Loser Loses</p>
                <p className="text-red-400 font-bold text-lg">{duel.bet_amount} coins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
