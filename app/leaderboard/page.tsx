import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get top players by coins
  const { data: topPlayers } = await supabase
    .from("profiles")
    .select("*")
    .order("coins", { ascending: false })
    .limit(20)

  // Get top players by wins
  const { data: topWinners } = await supabase.from("profiles").select("*").order("wins", { ascending: false }).limit(10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="text-purple-200">See how warriors rank in the arena</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
          >
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Richest Warriors */}
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Richest Warriors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPlayers?.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-yellow-900"
                            : index === 1
                              ? "bg-gray-400 text-gray-900"
                              : index === 2
                                ? "bg-amber-600 text-amber-900"
                                : "bg-purple-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{player.display_name}</p>
                        <p className="text-purple-300 text-sm">@{player.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{player.coins.toLocaleString()}</p>
                      <p className="text-purple-300 text-sm">coins</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Victorious */}
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Most Victorious</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topWinners?.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-yellow-900"
                            : index === 1
                              ? "bg-gray-400 text-gray-900"
                              : index === 2
                                ? "bg-amber-600 text-amber-900"
                                : "bg-purple-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{player.display_name}</p>
                        <p className="text-purple-300 text-sm">
                          {player.wins + player.losses > 0
                            ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}% win rate`
                            : "No battles yet"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{player.wins}</p>
                      <p className="text-purple-300 text-sm">wins</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
