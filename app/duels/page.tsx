import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AcceptDuelButton } from "@/components/accept-duel-button"

export default async function DuelsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to check coins
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get open duels (excluding user's own duels)
  const { data: openDuels } = await supabase
    .from("duels")
    .select(`
      *,
      creator:creator_id(username, display_name, wins, losses)
    `)
    .eq("status", "open")
    .neq("creator_id", user.id)
    .order("created_at", { ascending: false })

  // Get user's own duels
  const { data: myDuels } = await supabase
    .from("duels")
    .select(`
      *,
      creator:creator_id(username, display_name),
      opponent:opponent_id(username, display_name)
    `)
    .eq("creator_id", user.id)
    .in("status", ["open", "accepted", "in_progress"])
    .order("created_at", { ascending: false })

  // Filter duels user can afford
  const affordableDuels = openDuels?.filter((duel) => profile.coins >= duel.bet_amount) || []
  const unaffordableDuels = openDuels?.filter((duel) => profile.coins < duel.bet_amount) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Duel Board</h1>
            <p className="text-purple-200">Challenge warriors or accept their challenges</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/duels/create">Create Duel</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
            >
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* User's Coins */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Your Battle Coins</p>
                  <p className="text-purple-200 text-sm">Available for dueling</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{profile.coins.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* My Active Duels */}
        {myDuels && myDuels.length > 0 && (
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">My Active Duels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDuels.map((duel) => (
                  <div key={duel.id} className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/10">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant={
                          duel.status === "open" ? "secondary" : duel.status === "accepted" ? "default" : "destructive"
                        }
                        className={
                          duel.status === "open"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : duel.status === "accepted"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : "bg-green-500/20 text-green-300 border-green-500/30"
                        }
                      >
                        {duel.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-white font-bold">{duel.bet_amount}</p>
                        <p className="text-purple-300 text-xs">coins</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium">
                        {duel.status === "open" ? "Waiting for opponent..." : `vs ${duel.opponent?.display_name}`}
                      </p>
                      <p className="text-purple-300 text-sm">
                        Created {new Date(duel.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {(duel.status === "accepted" || duel.status === "in_progress") && (
                      <Button asChild size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700">
                        <Link href={`/battle/${duel.id}`}>
                          {duel.status === "accepted" ? "Enter Battle" : "Continue Battle"}
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Duels */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Available Duels</CardTitle>
          </CardHeader>
          <CardContent>
            {affordableDuels.length === 0 && unaffordableDuels.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-purple-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-purple-200 text-lg mb-2">No duels available</p>
                <p className="text-purple-300 text-sm mb-4">Be the first to create a duel!</p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/duels/create">Create First Duel</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Affordable Duels */}
                {affordableDuels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">You Can Afford</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {affordableDuels.map((duel) => (
                        <div
                          key={duel.id}
                          className="p-4 bg-slate-700/30 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {duel.creator?.display_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{duel.creator?.display_name}</p>
                                <p className="text-purple-300 text-xs">
                                  {duel.creator && duel.creator.wins + duel.creator.losses > 0
                                    ? `${Math.round((duel.creator.wins / (duel.creator.wins + duel.creator.losses)) * 100)}% win rate`
                                    : "New warrior"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{duel.bet_amount}</p>
                              <p className="text-purple-300 text-xs">coins</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-purple-200 text-sm">
                              Win {Math.floor(duel.bet_amount * 0.8)} coins if victorious
                            </p>
                            <AcceptDuelButton duelId={duel.id} betAmount={duel.bet_amount} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unaffordable Duels */}
                {unaffordableDuels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Need More Coins</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unaffordableDuels.map((duel) => (
                        <div
                          key={duel.id}
                          className="p-4 bg-slate-700/20 rounded-lg border border-red-500/20 opacity-60"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {duel.creator?.display_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{duel.creator?.display_name}</p>
                                <p className="text-purple-300 text-xs">
                                  {duel.creator && duel.creator.wins + duel.creator.losses > 0
                                    ? `${Math.round((duel.creator.wins / (duel.creator.wins + duel.creator.losses)) * 100)}% win rate`
                                    : "New warrior"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{duel.bet_amount}</p>
                              <p className="text-purple-300 text-xs">coins</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-red-400 text-sm">Need {duel.bet_amount - profile.coins} more coins</p>
                            <Button disabled className="w-full" variant="secondary">
                              Insufficient Coins
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
