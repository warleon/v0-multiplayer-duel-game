import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateDuelForm } from "@/components/create-duel-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CreateDuelPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Create Duel</h1>
            <p className="text-purple-200">Challenge other warriors to battle</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
          >
            <Link href="/duels">Back to Duels</Link>
          </Button>
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

        {/* Create Duel Form */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Duel Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateDuelForm maxCoins={profile.coins} />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">How Duels Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-purple-200 text-sm">Set your bet amount - this is what you'll risk in the duel</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-purple-200 text-sm">
                Other warriors can accept your challenge if they have enough coins
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-purple-200 text-sm">Winner takes 80% of the loser's bet amount as prize</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <p className="text-purple-200 text-sm">Battle in turn-based combat until one warrior is defeated</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
