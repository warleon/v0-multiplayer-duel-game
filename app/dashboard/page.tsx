import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { NotificationBell } from "@/components/notification-bell"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get recent duels
  const { data: recentDuels } = await supabase
    .from("duels")
    .select(`
      *,
      creator:creator_id(username, display_name),
      opponent:opponent_id(username, display_name),
      winner:winner_id(username, display_name)
    `)
    .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(5)

  const winRate =
    profile.wins + profile.losses > 0 ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {profile.display_name}</h1>
            <p className="text-purple-200">Ready for battle?</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Battle Coins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white">{profile.coins.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Victories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white">{profile.wins}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Defeats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white">{profile.losses}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white">{winRate}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Battle Arena</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-purple-200">Challenge other warriors or browse available duels</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/duels">Browse Duels</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                >
                  <Link href="/duels/create">Create Duel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-purple-200">See how you rank against other warriors</p>
              <Button
                asChild
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10 w-full bg-transparent"
              >
                <Link href="/leaderboard">View Rankings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Duels */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Battles</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDuels && recentDuels.length > 0 ? (
              <div className="space-y-3">
                {recentDuels.map((duel) => (
                  <div
                    key={duel.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          duel.status === "completed"
                            ? duel.winner_id === user.id
                              ? "bg-green-500"
                              : "bg-red-500"
                            : duel.status === "in_progress"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-white font-medium">
                          vs{" "}
                          {duel.creator_id === user.id
                            ? duel.opponent?.display_name || "Waiting..."
                            : duel.creator?.display_name}
                        </p>
                        <p className="text-purple-300 text-sm">
                          {duel.bet_amount} coins • {duel.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-200 text-sm">{new Date(duel.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-purple-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-purple-200">No battles yet</p>
                <p className="text-purple-300 text-sm">Start your first duel to see your battle history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
